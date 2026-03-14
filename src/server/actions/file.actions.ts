"use server";

import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { files_table } from "../db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "../db/mutations";

const utApi = new UTApi();

export async function createFile(input: {
  file: {
    name: string;
    size: number;
    url: string;
    parent: number;
  };
}) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await MUTATIONS.createFile({
    file: input.file,
    userId: session.userId,
  });

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function renameFile(fileId: number, name: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    return { error: "File not found" };
  }

  const fileKey = file.url.replace("https://8wqc1o9kco.ufs.sh/f/", "");
  const utapiResult = await utApi.renameFiles({
    fileKey,
    newName: name,
  });
  console.log(utapiResult);

  await MUTATIONS.renameFileById(fileId, session.userId, name);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function deleteFile(fileId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    return { error: "File not found" };
  }

  const utapiResult = await utApi.deleteFiles([
    file.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
  ]);
  console.log(utapiResult);

  await MUTATIONS.deleteFileById(fileId, session.userId);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
