"use server";

import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";
import { env } from "~/env";

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
      filesToDelete.map((f) => f.url.replace(env.UPLOADTHING_APP_URL, "")),
    );
    console.log(utapiResult);
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
};

export async function getFolderPropertiesAction(folderId: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const data = await queries.getFolderDetails(folderId, session.userId);
  if (!data) {
    return { error: "Folder not found" };
  }

  return { success: true, data };
}

export async function createFolderStructure(
  paths: string[],
  targetFolderId: string,
) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }
  const userId = session.userId;

  const idMap: Record<string, string> = { "": targetFolderId };

  const sortedPaths = [...paths].sort((a, b) => a.length - b.length);

  for (const path of sortedPaths) {
    if (!path) continue;

    const parts = path.split("/");
    let currentPath = "";

    for (const part of parts) {
      if (!part) continue;

      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!idMap[currentPath]) {
        const parentId = idMap[parentPath];
        if (!parentId) {
          throw new Error(`Parent folder ID not found for ${parentPath}`);
        }

        const res = await mutations.createFolderForUser(part, parentId, userId);
        idMap[currentPath] = res[0]!.id;
      }
    }
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true, idMap };
}
