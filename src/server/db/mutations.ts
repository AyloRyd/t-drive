import "server-only";

import { db } from "~/server/db";
import { filesTable, foldersTable } from "~/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";

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

  deleteFolderAndChildren: async function (folderId: string, userId: string) {
    const allFolders = await db
      .select()
      .from(foldersTable)
      .where(eq(foldersTable.ownerId, userId));

    const foldersToDelete = new Set<string>([folderId]);
    let added = true;
    while (added) {
      added = false;
      for (const folder of allFolders) {
        if (
          folder.parent !== null &&
          foldersToDelete.has(folder.parent) &&
          !foldersToDelete.has(folder.id)
        ) {
          foldersToDelete.add(folder.id);
          added = true;
        }
      }
    }

    const foldersToDeleteArray = Array.from(foldersToDelete);

    const filesToDelete = await db
      .select()
      .from(filesTable)
      .where(
        and(
          inArray(filesTable.parent, foldersToDeleteArray),
          eq(filesTable.ownerId, userId),
        ),
      );

    if (filesToDelete.length > 0) {
      await db
        .delete(filesTable)
        .where(
          and(
            inArray(filesTable.parent, foldersToDeleteArray),
            eq(filesTable.ownerId, userId),
          ),
        );
    }

    await db
      .delete(foldersTable)
      .where(
        and(
          inArray(foldersTable.id, foldersToDeleteArray),
          eq(foldersTable.ownerId, userId),
        ),
      );

    return { filesToDelete };
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
};
