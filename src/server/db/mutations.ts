import "server-only";

import { db } from "~/server/db";
import { filesTable, foldersTable } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

export const mutations = {
  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      parent: string;
    };
    userId: string;
  }) {
    return await db
      .insert(filesTable)
      .values({
        ...input.file,
        ownerId: input.userId,
      })
      .returning();
  },

  renameFileById: async function (
    fileId: string,
    userId: string,
    newName: string,
  ) {
    return await db
      .update(filesTable)
      .set({ name: newName })
      .where(and(eq(filesTable.id, fileId), eq(filesTable.ownerId, userId)));
  },

  deleteFileById: async function (fileId: string, userId: string) {
    return await db
      .delete(filesTable)
      .where(and(eq(filesTable.id, fileId), eq(filesTable.ownerId, userId)));
  },

  createFolderForUser: async function (
    name: string,
    parentId: string,
    userId: string,
  ) {
    return await db
      .insert(foldersTable)
      .values({
        name,
        parent: parentId,
        ownerId: userId,
      })
      .returning();
  },

  renameFolderById: async function (
    folderId: string,
    userId: string,
    newName: string,
  ) {
    return await db
      .update(foldersTable)
      .set({ name: newName })
      .where(
        and(eq(foldersTable.id, folderId), eq(foldersTable.ownerId, userId)),
      );
  },

  onboardUser: async function (userId: string) {
    const rootFolderId = (
      await db
        .insert(foldersTable)
        .values({
          name: "Root",
          parent: null,
          ownerId: userId,
        })
        .returning()
    )[0]!.id;

    await db.insert(foldersTable).values([
      {
        name: "Documents",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Images",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Videos",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Presentations",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Others",
        parent: rootFolderId,
        ownerId: userId,
      },
    ]);

    return rootFolderId;
  },

  deleteAllFilesForUser: async function (userId: string) {
    return await db.delete(filesTable).where(eq(filesTable.ownerId, userId));
  },

  deleteAllFoldersForUser: async function (userId: string) {
    return await db
      .delete(foldersTable)
      .where(eq(foldersTable.ownerId, userId));
  },
};
