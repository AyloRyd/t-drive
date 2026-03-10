import { Folder as FolderIcon, FileIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { deleteFile, deleteFolder } from "~/server/actions";
import type { DB_FileType, DB_FolderType } from "~/server/db/schema";

export function FileRow(props: { file: DB_FileType }) {
  const { file } = props;
  return (
    <li className="hover:bg-gray-750 border-b border-gray-700 px-6 py-4">
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <a
            href={file.url}
            className="flex cursor-pointer items-center text-gray-100 hover:text-blue-400"
            target="_blank"
          >
            <FileIcon className="mr-3" size={20} />
            {file.name}
          </a>
        </div>
        <div className="col-span-2 text-gray-400">{"file"}</div>
        <div className="col-span-3 text-gray-400">{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</div>{" "}
        <div className="col-span-1 text-gray-400">
          <Button
            className="cursor-pointer bg-gray-800 hover:bg-red-500"
            onClick={() =>
              confirm("Are you sure you want to delete this file?") &&
              deleteFile(file.id)
            }
            aria-label="Delete file"
          >
            <Trash2Icon size={20} />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function FolderRow(props: { folder: DB_FolderType }) {
  const { folder } = props;
  return (
    <li className="hover:bg-gray-750 border-b border-gray-700 px-6 py-4">
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <Link
            href={`/f/${folder.id}`}
            className="flex cursor-pointer items-center text-gray-100 hover:text-blue-400"
          >
            <FolderIcon className="mr-3" size={20} />
            {folder.name}
          </Link>
        </div>
        <div className="col-span-2 text-gray-400">{"folder"}</div>
        <div className="col-span-3 text-gray-400">{"..."}</div>
        <div className="col-span-1 text-gray-400">
          <Button
            className="cursor-pointer bg-gray-800 hover:bg-red-500"
            onClick={() =>
              confirm("Are you sure you want to delete this folder?") &&
              deleteFolder(folder.id)
            }
            aria-label="Delete folder"
          >
            <Trash2Icon size={20} />
          </Button>
        </div>
      </div>
    </li>
  );
}
