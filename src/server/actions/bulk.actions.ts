"use server";

import { UTApi } from "uploadthing/server";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";
import type { SelectedDriveItem } from "~/lib/types";
import { env } from "~/env";
import { createAction } from "./_utils/create-action";

const utApi = new UTApi();

export const deleteMultipleItems = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, items: SelectedDriveItem[]) => {
    const fileIdsToUTKeys: string[] = [];

    for (const item of items) {
      if (item.type === "file") {
        const file = await queries.getFileById(item.id, session.userId);
        if (file) {
          fileIdsToUTKeys.push(file.url.replace(env.UPLOADTHING_APP_URL, ""));
          await mutations.deleteFileById(item.id, session.userId);
        }
      } else if (item.type === "folder") {
        const targetFolder = await queries.getFolderById(
          item.id,
          session.userId,
        );
        if (targetFolder) {
          const { filesToDelete } = await mutations.deleteFolderAndChildren(
            item.id,
            session.userId,
          );
          if (filesToDelete && filesToDelete.length > 0) {
            fileIdsToUTKeys.push(
              ...filesToDelete.map((f) =>
                f.url.replace(env.UPLOADTHING_APP_URL, ""),
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

    return { success: true, data: {} };
  },
);
