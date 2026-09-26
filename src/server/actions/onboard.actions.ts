"use server";

import { mutations } from "../db/mutations";
import { createAction } from "./_utils/create-action";

export const onboardUser = createAction(
  { withAuth: true, refreshCookies: true },
  async (session) => {
    const rootFolderId = await mutations.onboardUser(session.userId);
    return { success: true, data: { rootFolderId } };
  },
);
