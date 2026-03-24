"use server";

import { auth } from "@clerk/nextjs/server";
import { mutations } from "../db/mutations";
import { cookies } from "next/headers";

export async function onboardUser() {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const rootFolderId = await mutations.onboardUser(session.userId);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true, rootFolderId };
}
