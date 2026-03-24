"use server";

import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";

const utApi = new UTApi();

export async function createFolder(name: string, parentId: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await mutations.createFolderForUser(name, parentId, session.userId);

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

  const folder = await queries.getFolderById(folderId, session.userId);
  if (!folder) {
    return { error: "Folder not found" };
  }

  await mutations.renameFolderById(folderId, session.userId, newName);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export const deleteFolder = async (folderId: string) => {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const targetFolder = await queries.getFolderById(folderId, session.userId);
  if (!targetFolder) {
    return { error: "Folder not found" };
  }

  const { filesToDelete } = await mutations.deleteFolderAndChildren(
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
