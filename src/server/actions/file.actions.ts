"use server";

import { UTApi } from "uploadthing/server";
import { mutations } from "../db/mutations";
import { queries } from "../db/queries";
import { env } from "~/env";
import { createAction } from "./_utils/create-action";

const utApi = new UTApi();

export const renameFile = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, { fileId, newName }: { fileId: string; newName: string }) => {
    const file = await queries.getFileById(fileId, session.userId);
    if (!file) {
      return { success: false, error: "File not found" };
    }

    const fileKey = file.url.replace(env.UPLOADTHING_APP_URL, "");
    const utapiResult = await utApi.renameFiles({
      fileKey,
      newName,
    });
    console.log(utapiResult);

    await mutations.renameFileById(fileId, session.userId, newName);

    return { success: true, data: {} };
  },
);

export const deleteFile = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, fileId: string) => {
    const file = await queries.getFileById(fileId, session.userId);
    if (!file) {
      return { success: false, error: "File not found" };
    }

    const utapiResult = await utApi.deleteFiles([
      file.url.replace(env.UPLOADTHING_APP_URL, ""),
    ]);
    console.log(utapiResult);

    await mutations.deleteFileById(fileId, session.userId);

    return { success: true, data: {} };
  },
);

export const getFile = createAction(
  { withAuth: true, refreshCookies: false },
  async (session, fileId: string) => {
    const data = await queries.getFileById(fileId, session.userId);
    if (!data) {
      return { success: false, error: "File not found" };
    }

    return { success: true, data };
  },
);

export const cleanupAbortedUpload = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, fileIds: string[]) => {
    if (fileIds.length === 0) {
      return { success: true, data: {} };
    }

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

    return { success: true, data: {} };
  },
);
