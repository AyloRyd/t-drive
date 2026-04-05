"use client";

import { Download, MoreVertical, Pencil, Trash2, Info } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { deleteFile, renameFile } from "~/server/actions/file.actions";
import { deleteFolder, renameFolder } from "~/server/actions/folder.actions";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { ActionDialog } from "./action-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { PropertiesDialog } from "./properties-dialog";
import { useState } from "react";
import type { DriveItemType } from "~/lib/types";

export function ItemActions({
  item,
  isFolder,
}: {
  item: DBFileType | DBFolderType;
  isFolder: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleDownload(driveItemType: DriveItemType) {
    return async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `/api/download/${driveItemType}?${driveItemType}Id=${item.id}`;
    };
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-800 p-0 text-gray-400 ring-1 ring-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:ring-gray-500 data-[state=open]:bg-gray-800 data-[state=open]:text-gray-400"
          aria-label={isFolder ? "Folder actions" : "File actions"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <MoreVertical size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-40 gap-2 rounded-xl border border-gray-700/50 bg-gray-900 p-1.5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PropertiesDialog
          id={item.id}
          isFolder={isFolder}
          trigger={
            <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/70 hover:text-white">
              <Info size={15} />
              Properties
            </button>
          }
        />
        <ActionDialog
          isFolder={isFolder}
          trigger={
            <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/70 hover:text-white">
              <Pencil size={15} />
              Rename
            </button>
          }
          title={isFolder ? "Rename folder" : "Rename file"}
          description={
            isFolder
              ? "Enter a new name for this folder."
              : "Enter a new name for this file."
          }
          submitLabel="Save"
          defaultValue={item.name}
          onSubmit={async (name) => {
            if (isFolder) {
              await renameFolder({ folderId: item.id, newName: name });
            } else {
              await renameFile({ fileId: item.id, newName: name });
            }
          }}
        />
        {isFolder ? (
          <button
            onClick={handleDownload("folder")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/70 hover:text-white"
          >
            <Download size={15} />
            Download
          </button>
        ) : (
          <button
            onClick={handleDownload("file")}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/70 hover:text-white"
          >
            <Download size={15} />
            Download
          </button>
        )}
        <ConfirmDialog
          trigger={
            <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-900/30 hover:text-red-300">
              <Trash2 size={15} />
              Delete
            </button>
          }
          title={isFolder ? "Delete folder" : "Delete file"}
          description={
            isFolder
              ? "Are you sure you want to delete this folder? All files and folders inside will be deleted."
              : "Are you sure you want to delete this file?"
          }
          actionLabel="Delete"
          onAction={async () => {
            if (isFolder) {
              await deleteFolder(item.id);
            } else {
              await deleteFile(item.id);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
