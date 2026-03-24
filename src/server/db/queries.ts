import "server-only";

import { db } from "~/server/db";
import { filesTable, foldersTable } from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const queries = {
  getFolders: async function (folderId: string, userId: string) {
    return db
      .select()
      .from(foldersTable)
      .where(
        and(
          eq(foldersTable.parent, folderId),
          eq(foldersTable.ownerId, userId),
        ),
      )
      .orderBy(foldersTable.name);
  },

  getFiles: async function (folderId: string, userId: string) {
    return db
      .select()
      .from(filesTable)
      .where(
        and(eq(filesTable.parent, folderId), eq(filesTable.ownerId, userId)),
      )
      .orderBy(filesTable.name);
  },

  getFileById: async function (fileId: string, userId: string) {
    return (
      await db
        .select()
        .from(filesTable)
        .where(and(eq(filesTable.id, fileId), eq(filesTable.ownerId, userId)))
    )[0];
  },

  getDriveData: async function (folderId: string, userId: string) {
    const folder = await queries.getFolderById(folderId, userId);
    if (!folder) {
      return { error: "Unauthorized" };
    }

    const [folders, files, parents] = await Promise.all([
      queries.getFolders(folderId, userId),
      queries.getFiles(folderId, userId),
      queries.getAllParentsForFolder(folderId),
    ]);

    if ("error" in parents) {
      return { error: "Unexpected error occured" };
    }

    return {
      folders,
      files,
      parents: parents as (typeof foldersTable.$inferSelect)[],
    };
  },

  getAllParentsForFolder: async function (folderId: string) {
    const parents = [];
    let currentId: string | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersTable)
        .where(eq(foldersTable.id, currentId));

      if (!folder[0]) {
        return { error: "Parent folder not found" };
      }
      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents.slice(1);
  },

  getFolderById: async function (folderId: string, userId: string) {
    return (
      await db
        .select()
        .from(foldersTable)
        .where(
          and(eq(foldersTable.id, folderId), eq(foldersTable.ownerId, userId)),
        )
    )[0];
  },

  getRootFolderForUser: async function (userId: string) {
    return (
      await db
        .select()
        .from(foldersTable)
        .where(
          and(eq(foldersTable.ownerId, userId), isNull(foldersTable.parent)),
        )
    )[0];
  },
};
