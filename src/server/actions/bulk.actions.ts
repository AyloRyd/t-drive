"use server";

import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";
import type { SelectedDriveItem } from "~/lib/types";

const utApi = new UTApi();

export const deleteMultipleItems = async (items: SelectedDriveItem[]) => {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const fileIdsToUTKeys: string[] = [];

  for (const item of items) {
    if (item.type === "file") {
      const file = await queries.getFileById(item.id, session.userId);
      if (file) {
        fileIdsToUTKeys.push(
          file.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
        );
        await mutations.deleteFileById(item.id, session.userId);
      }
    } else if (item.type === "folder") {
      const targetFolder = await queries.getFolderById(item.id, session.userId);
      if (targetFolder) {
        const { filesToDelete } = await mutations.deleteFolderAndChildren(
          item.id,
          session.userId,
        );
        if (filesToDelete && filesToDelete.length > 0) {
          fileIdsToUTKeys.push(
            ...filesToDelete.map((f) =>
              f.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
            ),
          );
        }
      }
    }
  }

  if (fileIdsToUTKeys.length > 0) {
    const utapiResult = await utApi.deleteFiles(fileIdsToUTKeys);
    console.log("Bulk delete files UT API:", utapiResult);
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
};
