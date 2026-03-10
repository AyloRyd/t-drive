import "server-only";

import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const QUERIES = {
  getFolders: async function (folderId: number) {
    const session = await auth();
    if (!session.userId) {
      return { error: "Unauthorized" };
    }
    return db
      .select()
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.parent, folderId),
          eq(foldersSchema.ownerId, session.userId),
        ),
      )
      .orderBy(foldersSchema.name);
  },
  getFiles: async function (folderId: number) {
    const session = await auth();
    if (!session.userId) {
      return { error: "Unauthorized" };
    }
    return db
      .select()
      .from(filesSchema)
      .where(
        and(
          eq(filesSchema.parent, folderId),
          eq(filesSchema.ownerId, session.userId),
        ),
      )
      .orderBy(filesSchema.name);
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
        throw new Error("Parent folder not found");
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

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      parent: number;
    };
    userId: string;
  }) {
    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
    });
  },
};
