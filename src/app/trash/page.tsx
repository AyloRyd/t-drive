import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { queries } from "~/server/db/queries";
import {
  getTrashForUser,
  purgeExpiredForUser,
} from "~/server/services/trash";
import { TrashContents } from "./trash-contents";

export const metadata = {
  title: "Trash",
  // Signed-in surface: never index, and don't follow into it.
  robots: { index: false, follow: false },
};

export default async function TrashPage() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }

  const rootFolder = await queries.getRootFolderForUser(session.userId);
  if (!rootFolder) {
    redirect("/drive");
  }

  // Keeps the retention promise even if the scheduled purge hasn't run yet
  // (or isn't configured): anything past its window is gone before listing.
  try {
    await purgeExpiredForUser(session.userId);
  } catch (error) {
    console.error("Purging expired trash on view failed:", error);
  }

  const items = await getTrashForUser(session.userId);

  return <TrashContents items={items} rootFolderId={rootFolder.id} />;
}
