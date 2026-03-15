import "server-only";

import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      parent: string;
    };
    userId: string;
  }) {
    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
    });
  },

  renameFileById: async function (
    fileId: string,
    userId: string,
    newName: string,
  ) {
    return await db
      .update(filesSchema)
      .set({ name: newName })
      .where(and(eq(filesSchema.id, fileId), eq(filesSchema.ownerId, userId)));
  },

  deleteFileById: async function (fileId: string, userId: string) {
    return await db
      .delete(filesSchema)
      .where(and(eq(filesSchema.id, fileId), eq(filesSchema.ownerId, userId)));
  },

  createFolderForUser: async function (
    name: string,
    parentId: string,
    userId: string,
  ) {
    return await db.insert(foldersSchema).values({
      name,
      parent: parentId,
      ownerId: userId,
    });
  },

  renameFolderById: async function (
    folderId: string,
    userId: string,
    newName: string,
  ) {
    return await db
      .update(foldersSchema)
      .set({ name: newName })
      .where(
        and(eq(foldersSchema.id, folderId), eq(foldersSchema.ownerId, userId)),
      );
  },

  deleteFolderAndChildren: async function (folderId: string, userId: string) {
    const allFolders = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.ownerId, userId));

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
      .from(filesSchema)
      .where(
        and(
          inArray(filesSchema.parent, foldersToDeleteArray),
          eq(filesSchema.ownerId, userId),
        ),
      );

    if (filesToDelete.length > 0) {
      await db
        .delete(filesSchema)
        .where(
          and(
            inArray(filesSchema.parent, foldersToDeleteArray),
            eq(filesSchema.ownerId, userId),
          ),
        );
    }

    await db
      .delete(foldersSchema)
      .where(
        and(
          inArray(foldersSchema.id, foldersToDeleteArray),
          eq(foldersSchema.ownerId, userId),
        ),
      );

    return { filesToDelete };
  },

  onboardUser: async function (userId: string) {
    const rootFolder = await db
      .insert(foldersSchema)
      .values({
        name: "Root",
        parent: null,
        ownerId: userId,
      })
      .returning();

    const rootFolderId = rootFolder[0]!.id;

    await db.insert(foldersSchema).values([
      {
        name: "Trash",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Shared",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Documents",
        parent: rootFolderId,
        ownerId: userId,
      },
    ]);

    return rootFolderId;
  },
};
