import { Folder as FolderIcon, FileIcon } from "lucide-react";
import Link from "next/link";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { ItemActions } from "./item-actions";
import { Checkbox } from "~/components/ui/checkbox";
import type { SelectedDriveItem } from "~/lib/types";

export default function DriveContentsGrid(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  currentFolderId: string;
  selectedItems: SelectedDriveItem[];
  onToggleSelect: (item: SelectedDriveItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {props.folders.map((folder) => (
        <DriveItemCard
          key={folder.id}
          item={folder}
          isFolder={true}
          isSelected={props.selectedItems.some(
            (i) => i.id === folder.id && i.type === "folder",
          )}
          onToggleSelect={() =>
            props.onToggleSelect({ id: folder.id, type: "folder" })
          }
        />
      ))}
      {props.files.map((file) => (
        <DriveItemCard
          key={file.id}
          item={file}
          isFolder={false}
          isSelected={props.selectedItems.some(
            (i) => i.id === file.id && i.type === "file",
          )}
          onToggleSelect={() =>
            props.onToggleSelect({ id: file.id, type: "file" })
          }
        />
      ))}
    </div>
  );
}

function DriveItemCard({
  item,
  isFolder,
  isSelected,
  onToggleSelect,
}: {
  item: DBFileType | DBFolderType;
  isFolder: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
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
    <div
      className={`group relative flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-700/50 p-6 text-center transition-colors hover:bg-gray-700/50 ${isSelected ? "bg-gray-800/80" : "bg-gray-800/30"}`}
    >
      <div
        className={`absolute top-2 left-2 flex p-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggleSelect();
        }}
      >
        <Checkbox checked={isSelected} />
      </div>
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
