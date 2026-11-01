"use server";

import { mutations } from "../db/mutations";
import { queries } from "../db/queries";
import { createAction } from "./_utils/create-action";

export const createFolder = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, name: string, parentId: string) => {
    await mutations.createFolderForUser(name, parentId, session.userId);
    return { success: true, data: {} };
  },
);

export const renameFolder = createAction(
  { withAuth: true, refreshCookies: true },
  async (
    session,
    { folderId, newName }: { folderId: string; newName: string },
  ) => {
    const folder = await queries.getFolderById(folderId, session.userId);
    if (!folder) {
      return { success: false, error: "Folder not found" };
    }

    await mutations.renameFolderById(folderId, session.userId, newName);

    return { success: true, data: {} };
  },
);

export const getFolderPropertiesAction = createAction(
  { withAuth: true, refreshCookies: false },
  async (session, folderId: string) => {
    const data = await queries.getFolderDetails(folderId, session.userId);
    if (!data) {
      return { success: false, error: "Folder not found" };
    }

    return { success: true, data };
  },
);

export const createFolderStructure = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, paths: string[], targetFolderId: string) => {
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
            return {
              success: false,
              error: `Parent folder ID not found for ${parentPath}`,
            };
          }

          const res = await mutations.createFolderForUser(
            part,
            parentId,
            userId,
          );
          idMap[currentPath] = res[0]!.id;
        }
      }
    }

    return { success: true, data: { idMap } };
  },
);
