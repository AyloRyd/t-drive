import { Folder as FolderIcon, FileIcon, Plus } from "lucide-react";
import Link from "next/link";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { ItemActions } from "./item-actions";
import { createFolder } from "~/server/actions/folder.actions";
import { ActionDialog } from "./action-dialog";
import { formatDate, formatSize } from "~/lib/utils";

export default function DriveContentsList(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  currentFolderId: string;
}) {
  return (
    <ul>
      {props.folders.map((folder) => (
        <DriveItemRow key={folder.id} item={folder} isFolder={true} />
      ))}
      {props.files.map((file) => (
        <DriveItemRow key={file.id} item={file} isFolder={false} />
      ))}
      <ActionDialog
        isFolder={true}
        trigger={
          <li className="flex cursor-pointer items-center justify-center gap-4 px-6 py-4 text-gray-400 transition-colors hover:bg-gray-700/50">
            <Plus size={20} />
            New folder
          </li>
        }
        title="New folder"
        description="Enter a name for your new folder."
        submitLabel="Create"
        onSubmit={async (name) => {
          await createFolder(name, props.currentFolderId);
        }}
      />
    </ul>
  );
}

function DriveItemRow({
  item,
  isFolder,
}: {
  item: DBFileType | DBFolderType;
  isFolder: boolean;
}) {
  const content = (
    <div className="grid grid-cols-12 items-center gap-4">
      <div className="col-span-7 flex items-center overflow-hidden md:col-span-7">
        {isFolder ? (
          <FolderIcon
            className="mr-3 shrink-0 text-yellow-500"
            fill="currentColor"
            size={20}
          />
        ) : (
          <FileIcon className="mr-3 shrink-0 text-blue-400" size={20} />
        )}
        <span className="truncate">{item.name}</span>
      </div>
      <div className="truncate text-sm text-gray-400 max-md:hidden md:col-span-2">
        {formatDate(item.created_at)}
      </div>
      <div className="col-span-3 truncate text-gray-400 md:col-span-2">
        {isFolder ? "—" : formatSize("size" in item ? item.size : 0)}
      </div>
      <div className="col-span-2 flex justify-end text-gray-400 md:col-span-1">
        <ItemActions item={item} isFolder={isFolder} />
      </div>
    </div>
  );

  const liClassName =
    "cursor-pointer border-b border-gray-700/50 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-700/50";

  return (
    <li className={liClassName}>
      {isFolder ? (
        <Link href={`/f/${item.id}`}>{content}</Link>
      ) : (
        <a href={"url" in item ? item.url : "#"} target="_blank">
          {content}
        </a>
      )}
    </li>
  );
}
