"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileIcon,
  FolderIcon,
  Calendar,
  HardDrive,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getFilePropertiesAction } from "~/server/actions/file.actions";
import { getFolderPropertiesAction } from "~/server/actions/folder.actions";
import { formatDate, formatSize } from "~/lib/utils";

type PropertyData = {
  name: string;
  created_at: Date | string;
  size?: number;
  totalSize?: number;
  totalItems?: number;
};

export function PropertiesDialog({
  id,
  isFolder,
  trigger,
}: {
  id: string;
  isFolder: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["properties", id, isFolder],
    queryFn: async () => {
      if (isFolder) {
        const res = await getFolderPropertiesAction(id);
        if (res.success && res.data) return res.data as PropertyData;
        throw new Error("Failed to load folder properties");
      } else {
        const res = await getFilePropertiesAction(id);
        if (res.success && res.data) return res.data as PropertyData;
        throw new Error("Failed to load file properties");
      }
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 p-0 text-gray-100 shadow-2xl backdrop-blur-md sm:max-w-sm">
        <DialogHeader className="px-6 pt-6 pb-4 text-left">
          <DialogTitle>Properties</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col px-6 pb-6">
          {loading ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-gray-800"></div>
                <div className="flex w-full flex-col gap-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-800"></div>
                  <div className="h-3 w-1/4 animate-pulse rounded bg-gray-800"></div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-12 w-full animate-pulse rounded-lg bg-gray-800/50"></div>
                <div className="h-12 w-full animate-pulse rounded-lg bg-gray-800/50"></div>
                {isFolder && (
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-800/50"></div>
                )}
              </div>
            </div>
          ) : data ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-gray-400">
                  {isFolder ? <FolderIcon size={24} /> : <FileIcon size={24} />}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h3
                    className="truncate text-lg font-semibold text-gray-100"
                    title={data.name}
                  >
                    {data.name}
                  </h3>
                  <span className="text-sm font-medium text-gray-500">
                    {isFolder ? "Folder" : "File"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-gray-700/30 bg-gray-800/50 px-4 py-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar size={18} />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {formatDate(data.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-700/30 bg-gray-800/50 px-4 py-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <HardDrive size={18} />
                    <span className="text-sm font-medium">Size</span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {isFolder
                      ? formatSize(data.totalSize ?? 0)
                      : formatSize(data.size ?? 0)}
                  </span>
                </div>

                {isFolder && (
                  <div className="flex items-center justify-between rounded-lg border border-gray-700/30 bg-gray-800/50 px-4 py-3">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Layers size={18} />
                      <span className="text-sm font-medium">Items inside</span>
                    </div>
                    <span className="text-sm font-medium text-gray-200">
                      {data.totalItems}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-400">Failed to load properties.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
