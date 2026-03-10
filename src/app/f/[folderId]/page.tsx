import DriveContents from "./drive-contetns";
import { QUERIES } from "~/server/db/queries";

export default async function FolderPage(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;

  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }

  const [folders, files, parents] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
  ]);

  if ("error" in folders || "error" in files) {
    return <div>Unauthorized</div>;
  }

  return (
    <DriveContents
      files={files}
      folders={folders}
      parents={parents}
      currentFolderId={parsedFolderId}
    />
  );
}
