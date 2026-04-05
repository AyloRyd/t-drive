import { FileIcon } from "./file-icon";
import Link from "next/link";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { ItemActions } from "./item-actions";
import { formatDate, formatSize } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { useSelectedItems } from "~/hooks/use-selected-items";

export default function DriveContentsList(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  currentFolderId: string;
}) {
  const { selectedItems, toggleSelect } = useSelectedItems();

  return (
    <div className="overflow-hidden rounded-xl bg-gray-800/50 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
      <div className="border-t-0 border-r-0 border-b border-l-0 border-gray-700/50 bg-gray-800/30 px-6 py-4">
        <div className="grid grid-cols-12 items-center gap-4 text-xs font-medium text-gray-400 md:text-sm">
          <div className="col-span-7 flex items-center gap-4 md:col-span-7">
            <div className="w-4 shrink-0" />
            <span>Name</span>
          </div>
          <div className="max-md:hidden md:col-span-2">Created at</div>
          <div className="col-span-3 md:col-span-2">Size</div>
          <div className="col-span-2 flex justify-end md:col-span-1">
            Actions
          </div>
        </div>
      </div>
      <ul>
        {props.folders.map((folder) => (
          <DriveItemRow
            key={folder.id}
            item={folder}
            isFolder={true}
            isSelected={selectedItems.some(
              (i) => i.id === folder.id && i.type === "folder",
            )}
            onToggleSelect={() =>
              toggleSelect({ id: folder.id, type: "folder" })
            }
          />
        ))}
        {props.files.map((file) => (
          <DriveItemRow
            key={file.id}
            item={file}
            isFolder={false}
            isSelected={selectedItems.some(
              (i) => i.id === file.id && i.type === "file",
            )}
            onToggleSelect={() => toggleSelect({ id: file.id, type: "file" })}
          />
        ))}
      </ul>
    </div>
  );
}

function DriveItemRow({
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
    <div className="grid grid-cols-12 items-center gap-4">
      <div className="col-span-7 flex items-center overflow-hidden md:col-span-7">
        <div
          className="mr-3 flex shrink-0 items-center justify-center pr-2"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleSelect();
          }}
        >
          <Checkbox checked={isSelected} />
        </div>
        <FileIcon
          type={isFolder ? "folder" : "file"}
          name={item.name}
          size={20}
          className="mr-3 shrink-0"
        />
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

  return (
    <li
      className={`cursor-pointer border-b border-gray-700/50 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-700/50 ${isSelected ? "bg-gray-800/80" : ""}`}
    >
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
