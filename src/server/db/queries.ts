import "server-only";

import { db } from "~/server/db";
import { filesTable, foldersTable } from "~/server/db/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";

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

  getFolderDetails: async function (folderId: string, userId: string) {
    const folder = await queries.getFolderById(folderId, userId);
    if (!folder) return null;

    const allFolders = await db
      .select()
      .from(foldersTable)
      .where(eq(foldersTable.ownerId, userId));

    const foldersUnder = new Set<string>([folderId]);
    let added = true;
    while (added) {
      added = false;
      for (const f of allFolders) {
        if (
          f.parent !== null &&
          foldersUnder.has(f.parent) &&
          !foldersUnder.has(f.id)
        ) {
          foldersUnder.add(f.id);
          added = true;
        }
      }
    }

    const foldersUnderArray = Array.from(foldersUnder);

    let filesUnder: (typeof filesTable.$inferSelect)[] = [];
    if (foldersUnderArray.length > 0) {
      filesUnder = await db
        .select()
        .from(filesTable)
        .where(
          and(
            inArray(filesTable.parent, foldersUnderArray),
            eq(filesTable.ownerId, userId),
          ),
        );
    }

    const totalSize = filesUnder.reduce((acc, file) => acc + file.size, 0);
    const totalItems = foldersUnderArray.length - 1 + filesUnder.length;

    return {
      ...folder,
      totalSize,
      totalItems,
    };
  },

  getFileDetails: async function (fileId: string, userId: string) {
    return await queries.getFileById(fileId, userId);
  },
};
