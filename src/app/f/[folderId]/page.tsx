import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { QUERIES } from "~/server/db/queries";
import DriveContents from "./components/drive-contetns";

export default async function FolderPage(props: {
  params: Promise<{ folderId: string }>;
}) {
  const session = await auth();
  if (!session.userId) {
    notFound();
  }

  const params = await props.params;

  const driveData = await QUERIES.getDriveData(params.folderId, session.userId);
  if ("error" in driveData) {
    if (driveData.error === "Unauthorized") {
      notFound();
    }
    throw new Error("Unexpected error occured");
  }
  const { files, folders, parents } = driveData;

  const rootFolder = await QUERIES.getRootFolderForUser(session.userId);
  if (!rootFolder) {
    notFound();
  }

  return (
    <DriveContents
      files={files}
      folders={folders}
      parents={parents}
      currentFolderId={params.folderId}
      rootFolderId={rootFolder.id}
    />
  );
}
