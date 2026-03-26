import { Folder as FolderIcon, FileIcon, Plus } from "lucide-react";
import Link from "next/link";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { FileRowActions, FolderRowActions } from "./row-actions";
import { createFolder } from "~/server/actions/folder.actions";
import { FolderDialog } from "./action-dialog";

export default function DriveContentsGrid(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  currentFolderId: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {props.folders.map((folder) => (
        <FolderGridItem key={folder.id} folder={folder} />
      ))}
      {props.files.map((file) => (
        <FileGridItem key={file.id} file={file} />
      ))}
      <FolderDialog
        isFolder={true}
        trigger={
          <div
            className={`${gridItemClass} min-h-[140px] cursor-pointer text-gray-400`}
          >
            <Plus
              size={48}
              className="text-gray-500 transition-colors group-hover:text-gray-300"
            />
            <span className="w-full truncate text-sm font-medium">
              New folder
            </span>
          </div>
        }
        title="New folder"
        description="Enter a name for your new folder."
        submitLabel="Create"
        onSubmit={async (name) => {
          await createFolder(name, props.currentFolderId);
        }}
      />
    </div>
  );
}

const gridItemClass =
  "group relative flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 text-center transition-colors hover:bg-gray-700/50";
const actionsClass = "absolute top-2 right-2";
const linkClass = "flex w-full flex-col items-center gap-3";
const nameClass = "w-full truncate text-sm font-medium text-gray-200";

function FileGridItem(props: { file: DBFileType }) {
  const { file } = props;
  return (
    <div className={gridItemClass}>
      <div className={actionsClass}>
        <FileRowActions file={file} />
      </div>
      <a href={file.url} target="_blank" className={linkClass}>
        <FileIcon className="text-blue-400" size={48} />
        <span className={nameClass} title={file.name}>
          {file.name}
        </span>
      </a>
    </div>
  );
}

function FolderGridItem(props: { folder: DBFolderType }) {
  const { folder } = props;
  return (
    <div className={gridItemClass}>
      <div className={actionsClass}>
        <FolderRowActions folder={folder} />
      </div>
      <Link href={`/f/${folder.id}`} className={linkClass}>
        <FolderIcon className="text-yellow-500" fill="currentColor" size={48} />
        <span className={nameClass} title={folder.name}>
          {folder.name}
        </span>
      </Link>
    </div>
  );
}
