import { Folder as FolderIcon, FileIcon, Plus } from "lucide-react";
import Link from "next/link";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { ItemActions } from "./item-actions";
import { createFolder } from "~/server/actions/folder.actions";
import { ActionDialog } from "./action-dialog";

export default function DriveContentsGrid(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  currentFolderId: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {props.folders.map((folder) => (
        <DriveItemCard key={folder.id} item={folder} isFolder={true} />
      ))}
      {props.files.map((file) => (
        <DriveItemCard key={file.id} item={file} isFolder={false} />
      ))}
      <ActionDialog
        isFolder={true}
        trigger={
          <div className="group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 text-center tracking-wide text-gray-400 transition-colors hover:bg-gray-700/50">
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

function DriveItemCard({
  item,
  isFolder,
}: {
  item: DBFileType | DBFolderType;
  isFolder: boolean;
}) {
  const content = (
    <>
      {isFolder ? (
        <FolderIcon className="text-yellow-500" fill="currentColor" size={48} />
      ) : (
        <FileIcon className="text-blue-400" size={48} />
      )}
      <span
        className="w-full truncate text-sm font-medium text-gray-200"
        title={item.name}
      >
        {item.name}
      </span>
    </>
  );

  const wrapperClass = "flex w-full flex-col items-center gap-3";

  return (
    <div className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 text-center transition-colors hover:bg-gray-700/50">
      <div className="absolute top-2 right-2">
        <ItemActions item={item} isFolder={isFolder} />
      </div>
      {isFolder ? (
        <Link href={`/f/${item.id}`} className={wrapperClass}>
          {content}
        </Link>
      ) : (
        <a
          href={"url" in item ? item.url : "#"}
          target="_blank"
          className={wrapperClass}
        >
          {content}
        </a>
      )}
    </div>
  );
}
