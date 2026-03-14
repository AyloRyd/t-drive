import "server-only";

import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const QUERIES = {
  getFolders: async function (folderId: number, userId: string) {
    return db
      .select()
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.parent, folderId),
          eq(foldersSchema.ownerId, userId),
        ),
      )
      .orderBy(foldersSchema.name);
  },

  getFiles: async function (folderId: number, userId: string) {
    return db
      .select()
      .from(filesSchema)
      .where(
        and(
          eq(filesSchema.parent, folderId),
          eq(filesSchema.ownerId, userId),
        ),
      )
      .orderBy(filesSchema.name);
  },

  getDriveData: async function (folderId: number, userId: string) {
    const folder = await QUERIES.getFolderById(folderId);
    if (folder?.ownerId !== userId) {
      return { error: "Unauthorized" };
    }

    const [folders, files, parents] = await Promise.all([
      QUERIES.getFolders(folderId, userId),
      QUERIES.getFiles(folderId, userId),
      QUERIES.getAllParentsForFolder(folderId),
    ]);

    if ("error" in parents) {
      return { error: "Unexpected error occured" };
    }

    return { folders, files, parents: parents as typeof foldersSchema.$inferSelect[] };
  },

  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId));

      if (!folder[0]) {
        return { error: "Parent folder not found" };
      }
      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents.slice(1);
  },

  getFolderById: async function (folderId: number) {
    return (
      await db
        .select()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, folderId))
    )[0];
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
  },
};
