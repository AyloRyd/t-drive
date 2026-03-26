"use server";

import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";

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

  const fileKey = file.url.replace("https://8wqc1o9kco.ufs.sh/f/", "");
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
    file.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
  ]);
  console.log(utapiResult);

  await mutations.deleteFileById(fileId, session.userId);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
};
