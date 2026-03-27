"use client";

import { Trash2, List, LayoutGrid } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { ConfirmDialog } from "./confirm-dialog";
import { deleteMultipleItems } from "~/server/actions/bulk.actions";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { NewItemButton } from "./new-item-button";
import type { SelectedDriveItem } from "~/lib/types";

interface DriveActionBarProps {
  filesLength: number;
  foldersLength: number;
  currentFolderId: string;
  selectedItems: SelectedDriveItem[];
  setSelectedItems: React.Dispatch<React.SetStateAction<SelectedDriveItem[]>>;
  folders: DBFolderType[];
  files: DBFileType[];
}

export function DriveActionBar({
  filesLength,
  foldersLength,
  currentFolderId,
  selectedItems,
  setSelectedItems,
  folders,
  files,
}: DriveActionBarProps) {
  const totalItems = filesLength + foldersLength;
  const allSelected = totalItems > 0 && selectedItems.length === totalItems;
  const someSelected = selectedItems.length > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFolders = folders.map((f) => ({
        id: f.id,
        type: "folder" as const,
      }));
      const allFiles = files.map((f) => ({ id: f.id, type: "file" as const }));
      setSelectedItems([...allFolders, ...allFiles]);
    } else {
      setSelectedItems([]);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-800/50 p-3 px-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
        <NewItemButton currentFolderId={currentFolderId} />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {someSelected ? (
          <ConfirmDialog
            trigger={
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-red-900/50 text-red-500 transition-colors hover:bg-red-900 hover:text-red-400">
                <Trash2 size={18} />
              </button>
            }
            title="Delete items?"
            description={`Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`}
            actionLabel="Delete"
            onAction={async () => {
              await deleteMultipleItems(selectedItems);
              setSelectedItems([]);
            }}
          />
        ) : (
          <button
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-600 opacity-50"
          >
            <Trash2 size={18} />
          </button>
        )}
        <TabsList className="h-8 bg-gray-800/50 p-1 ring-1 ring-gray-700/50">
          <TabsTrigger
            value="list"
            className="h-6 cursor-pointer px-2 text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            <List size={16} />
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="h-6 cursor-pointer px-2 text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            <LayoutGrid size={16} />
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}
