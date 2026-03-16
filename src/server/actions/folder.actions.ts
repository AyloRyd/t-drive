"use server";

import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { folders_table as foldersSchema } from "../db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "../db/mutations";

const utApi = new UTApi();

export async function createFolder(name: string, parentId: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await MUTATIONS.createFolderForUser(name, parentId, session.userId);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function renameFolder({
  folderId,
  newName,
}: {
  folderId: string;
  newName: string;
}) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [folder] = await db
    .select()
    .from(foldersSchema)
    .where(
      and(
        eq(foldersSchema.id, folderId),
        eq(foldersSchema.ownerId, session.userId),
      ),
    );

  if (!folder) {
    return { error: "Folder not found" };
  }

  await MUTATIONS.renameFolderById(folderId, session.userId, newName);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export const deleteFolder = async (folderId: string) => {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [targetFolder] = await db
    .select()
    .from(foldersSchema)
    .where(
      and(
        eq(foldersSchema.id, folderId),
        eq(foldersSchema.ownerId, session.userId),
      ),
    );

  if (!targetFolder) {
    return { error: "Folder not found" };
  }

  const { filesToDelete } = await MUTATIONS.deleteFolderAndChildren(
    folderId,
    session.userId,
  );

  if (filesToDelete && filesToDelete.length > 0) {
    const utapiResult = await utApi.deleteFiles(
      filesToDelete.map((f) =>
        f.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
      ),
    );
    console.log(utapiResult);
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
};
