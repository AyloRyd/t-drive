"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

const utApi = new UTApi();

export async function createFolder(name: string, parentId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await db.insert(folders_table).values({
    name,
    parent: parentId,
    ownerId: session.userId,
  });

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

  const dbDeleteResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));

  console.log(dbDeleteResult);

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function deleteFolder(folderId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [targetFolder] = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.id, folderId),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  if (!targetFolder) {
    return { error: "Folder not found" };
  }

  const allFolders = await db
    .select()
    .from(folders_table)
    .where(eq(folders_table.ownerId, session.userId));

  const foldersToDelete = new Set<number>([folderId]);
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
    .from(files_table)
    .where(
      and(
        inArray(files_table.parent, foldersToDeleteArray),
        eq(files_table.ownerId, session.userId),
      ),
    );

  if (filesToDelete.length > 0) {
    const utapiResult = await utApi.deleteFiles(
      filesToDelete.map((f) =>
        f.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
      ),
    );
    console.log(utapiResult);

    await db
      .delete(files_table)
      .where(
        and(
          inArray(files_table.parent, foldersToDeleteArray),
          eq(files_table.ownerId, session.userId),
        ),
      );
  }

  await db
    .delete(folders_table)
    .where(
      and(
        inArray(folders_table.id, foldersToDeleteArray),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
