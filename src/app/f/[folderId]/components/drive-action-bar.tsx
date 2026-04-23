"use client";

import { Trash2, List, LayoutGrid, Download } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { ConfirmDialog } from "./confirm-dialog";
import { deleteMultipleItems } from "~/server/actions/bulk.actions";
import { TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { NewItemButton } from "./new-item-button";
import { useSelectedItems } from "~/hooks/use-selected-items";
import { useProgress } from "~/hooks/use-progress";
import { useRouter } from "next/navigation";

interface DriveActionBarProps {
  currentFolderId: string;
  folders: DBFolderType[];
  files: DBFileType[];
}

export function DriveActionBar({
  currentFolderId,
  folders,
  files,
}: DriveActionBarProps) {
  const { selectedItems, selectAll, clearSelection } = useSelectedItems();
  const { startProcess, updateProgress, finishProcess } = useProgress();
  const navigate = useRouter();

  const totalItems = files.length + folders.length;
  const allSelected = totalItems > 0 && selectedItems.length === totalItems;
  const someSelected = selectedItems.length > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFolders = folders.map((f) => ({
        id: f.id,
        type: "folder" as const,
      }));
      const allFiles = files.map((f) => ({ id: f.id, type: "file" as const }));
      selectAll([...allFolders, ...allFiles]);
    } else {
      clearSelection();
    }
  };

  const handleBulkDownload = async () => {
    if (!someSelected) return;

    startProcess("download", selectedItems.length, null);
    try {
      const res = await fetch("/api/download/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: selectedItems }),
      });

      if (!res.ok) {
        throw new Error(`Bulk download failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(
        /filename\*=UTF-8''([^;]+)/,
      );
      const filename = filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1])
        : "t-drive-dowload.zip";

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      updateProgress(selectedItems.length);
    } catch (error) {
      console.error(error);
    } finally {
      finishProcess();
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
        <button
          onClick={handleBulkDownload}
          disabled={!someSelected}
          className={
            someSelected
              ? "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-sky-900/50 text-sky-500 transition-colors hover:bg-sky-900 hover:text-sky-400"
              : "flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-600 opacity-50"
          }
          aria-label="Download selected items"
        >
          <Download size={18} />
        </button>
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
              startProcess("delete", selectedItems.length, null);
              deleteMultipleItems(selectedItems)
                .then(async () => {
                  updateProgress(selectedItems.length);
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  clearSelection();
                  finishProcess();
                  navigate.refresh();
                })
                .catch((e) => {
                  console.error(e);
                  finishProcess();
                });
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
