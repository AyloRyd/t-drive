"use server";

import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";
import { env } from "~/env";

const utApi = new UTApi();

export async function renameFile({
  fileId,
  newName,
}: {
  fileId: string;
  newName: string;
}) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const file = await queries.getFileById(fileId, session.userId);
  if (!file) {
    return { error: "File not found" };
  }

  const fileKey = file.url.replace(env.UPLOADTHING_APP_URL, "");
  const utapiResult = await utApi.renameFiles({
    fileKey,
    newName,
  });
  console.log(utapiResult);

  await mutations.renameFileById(fileId, session.userId, newName);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export const deleteFile = async (fileId: string) => {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const file = await queries.getFileById(fileId, session.userId);
  if (!file) {
    return { error: "File not found" };
  }

  const utapiResult = await utApi.deleteFiles([
    file.url.replace(env.UPLOADTHING_APP_URL, ""),
  ]);
  console.log(utapiResult);

  await mutations.deleteFileById(fileId, session.userId);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
};

export async function getFilePropertiesAction(fileId: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const data = await queries.getFileById(fileId, session.userId);
  if (!data) {
    return { error: "File not found" };
  }

  return { success: true, data };
}

export async function cleanupAbortedUpload(fileIds: string[]) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  if (fileIds.length === 0) return { success: true };

  const filesToDelete = [];
  for (const fileId of fileIds) {
    const file = await queries.getFileById(fileId, session.userId);
    if (file) {
      filesToDelete.push(file);
      await mutations.deleteFileById(fileId, session.userId);
    }
  }

  if (filesToDelete.length > 0) {
    const utapiResult = await utApi.deleteFiles(
      filesToDelete.map((f) => f.url.replace(env.UPLOADTHING_APP_URL, "")),
    );
    console.log("Cleanup UploadThing:", utapiResult);
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
