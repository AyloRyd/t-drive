import { Folder as FolderIcon, FileIcon } from "lucide-react";
import Link from "next/link";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { FileRowActions, FolderRowActions } from "./row-actions";

const rowClass =
  "cursor-pointer border-b border-gray-700/50 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-700/50";
const gridClass = "grid grid-cols-12 items-center gap-4";
const nameColClass =
  "col-span-7 flex items-center overflow-hidden md:col-span-9";
const sizeColClass = "col-span-3 truncate text-gray-400 md:col-span-2";
const actionsColClass =
  "col-span-2 flex justify-end text-gray-400 md:col-span-1";
const iconClass = "mr-3 shrink-0";

export function FileRow(props: { file: DBFileType }) {
  const { file } = props;
  return (
    <li className={rowClass}>
      <a href={file.url} target="_blank">
        <div className={gridClass}>
          <div className={nameColClass}>
            <FileIcon className={`${iconClass} text-blue-400`} size={20} />
            <span className="truncate">{file.name}</span>
          </div>
          <div className={sizeColClass}>
            {`${(file.size / 1024 / 1024).toFixed(2)} MB`}
          </div>
          <div className={actionsColClass}>
            <FileRowActions file={file} />
          </div>
        </div>
      </a>
    </li>
  );
}

export function FolderRow(props: { folder: DBFolderType }) {
  const { folder } = props;
  return (
    <li className={rowClass}>
      <Link href={`/f/${folder.id}`}>
        <div className={gridClass}>
          <div className={nameColClass}>
            <FolderIcon
              className={`${iconClass} text-yellow-500`}
              fill="currentColor"
              size={20}
            />
            <span className="truncate">{folder.name}</span>
          </div>
          <div className={sizeColClass}>{"—"}</div>
          <div className={actionsColClass}>
            <FolderRowActions folder={folder} />
          </div>
        </div>
      </Link>
    </li>
  );
}
