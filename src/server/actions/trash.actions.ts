"use server";

import type { SelectedDriveItem } from "~/lib/types";
import {
  deleteForever,
  emptyTrash,
  restoreItems,
  trashItems,
} from "../services/trash";
import { createAction } from "./_utils/create-action";

export const moveToTrash = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, items: SelectedDriveItem[]) => {
    const { count } = await trashItems(session.userId, items);
    if (count === 0) {
      return { success: false, error: "Nothing was moved to trash" };
    }
    return { success: true, data: { count } };
  },
);

export const restoreFromTrash = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, items: SelectedDriveItem[]) => {
    const result = await restoreItems(session.userId, items);
    if (result.restored === 0) {
      return { success: false, error: "Nothing was restored" };
    }
    return { success: true, data: result };
  },
);

export const deleteItemsForever = createAction(
  { withAuth: true, refreshCookies: true },
  async (session, items: SelectedDriveItem[]) => {
    const { count } = await deleteForever(session.userId, items);
    return { success: true, data: { count } };
  },
);

export const emptyTrashAction = createAction(
  { withAuth: true, refreshCookies: true },
  async (session) => {
    const { count } = await emptyTrash(session.userId);
    return { success: true, data: { count } };
  },
);
