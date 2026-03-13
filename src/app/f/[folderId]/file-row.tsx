import { Folder as FolderIcon, FileIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { deleteFile, deleteFolder } from "~/server/actions";
import type { DBFileType, DBFolderType } from "~/server/db/schema";

export function FileRow(props: { file: DBFileType }) {
  const { file } = props;
  return (
    <li className="cursor-pointer border-b border-gray-700/50 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-700/50">
      <a href={file.url} target="_blank">
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-7 flex items-center overflow-hidden md:col-span-9">
            <FileIcon className="mr-3 shrink-0 text-blue-400" size={20} />
            <span className="truncate">{file.name}</span>
          </div>
          <div className="col-span-3 truncate text-gray-400 md:col-span-2">{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</div>
          <div className="col-span-2 flex justify-end text-gray-400 md:col-span-1">
            <Button
              variant="ghost"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-800 p-0 text-gray-400 ring-1 ring-gray-700 transition-colors hover:bg-red-800 hover:text-white hover:ring-red-500"
              onClick={async (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to delete this file?")) {
                  await deleteFile(file.id);
                }
              }}
              aria-label="Delete file"
            >
              <Trash2Icon size={18} />
            </Button>
          </div>
        </div>
      </a>
    </li>
  );
}

export function FolderRow(props: { folder: DBFolderType }) {
  const { folder } = props;
  return (
    <li className="cursor-pointer border-b border-gray-700/50 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-700/50">
      <Link href={`/f/${folder.id}`}>
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-7 flex items-center overflow-hidden md:col-span-9">
            <FolderIcon
              className="mr-3 shrink-0 text-yellow-500"
              fill="currentColor"
              size={20}
            />
            <span className="truncate">{folder.name}</span>
          </div>
          <div className="col-span-3 truncate text-gray-400 md:col-span-2">
            {"—"}
          </div>
          <div className="col-span-2 flex justify-end text-gray-400 md:col-span-1">
            <Button
              variant="ghost"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-800 p-0 text-gray-400 ring-1 ring-gray-700 transition-colors hover:bg-red-800 hover:text-white hover:ring-red-500"
              onClick={async (e) => {
                e.preventDefault();
                if (
                  confirm(
                    "Are you sure you want to delete this folder? All files and folders inside this folder will be deleted.",
                  )
                ) {
                  await deleteFolder(folder.id);
                }
              }}
              aria-label="Delete folder"
            >
              <Trash2Icon size={18} />
            </Button>
          </div>
        </div>
      </Link>
    </li>
  );
}
