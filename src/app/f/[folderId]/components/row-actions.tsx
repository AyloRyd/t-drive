"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { deleteFile, deleteFolder, renameFolder } from "~/server/actions";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { FolderDialog } from "./folder-dialog";
import { useState } from "react";

const triggerClass =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-gray-800 p-0 text-gray-400 ring-1 ring-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:ring-gray-500 data-[state=open]:bg-gray-800 data-[state=open]:text-gray-400";
const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/70 hover:text-white";
const dangerItemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-900/30 hover:text-red-300";
const popoverContentClass =
  "w-40 gap-2 rounded-xl border border-gray-700/50 bg-gray-900 p-1.5 shadow-2xl";

export function FolderRowActions({ folder }: { folder: DBFolderType }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={triggerClass}
          aria-label="Folder actions"
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
        className={popoverContentClass}
        onClick={(e) => e.stopPropagation()}
      >
        <FolderDialog
          trigger={
            <button className={menuItemClass}>
              <Pencil size={15} />
              Edit
            </button>
          }
          title="Rename folder"
          description="Enter a new name for this folder."
          submitLabel="Save"
          defaultValue={folder.name}
          onSubmit={async (name) => {
            await renameFolder(folder.id, name);
          }}
        />

        <button
          className={dangerItemClass}
          onClick={async () => {
            if (
              confirm(
                "Are you sure you want to delete this folder? All files and folders inside will be deleted.",
              )
            ) {
              await deleteFolder(folder.id);
            }
          }}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}

export function FileRowActions({ file }: { file: DBFileType }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={triggerClass}
          aria-label="File actions"
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
        className={popoverContentClass}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          title="This feature is not yet implemented for files"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 opacity-50 select-none"
        >
          <Pencil size={15} />
          Edit
        </span>

        <button
          className={dangerItemClass}
          onClick={async (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to delete this file?")) {
              await deleteFile(file.id);
            }
          }}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
}
