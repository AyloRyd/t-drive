"use client";

import { useState } from "react";
import { Plus, FolderPlus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ActionDialog } from "./action-dialog";
import { UploadButton } from "~/components/uploadthing";
import { createFolder } from "~/server/actions/folder.actions";
import { Progress } from "~/components/ui/progress";

interface NewItemButtonProps {
  currentFolderId: string;
}

export function NewItemButton({ currentFolderId }: NewItemButtonProps) {
  const navigate = useRouter();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  return (
    <>
      {uploadProgress !== null && (
        <div className="fixed top-0 left-0 z-50 w-full">
          <Progress
            value={uploadProgress}
            className="h-1.5 w-full rounded-none bg-teal-800 [&>div]:bg-teal-500"
          />
        </div>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none">
            <Plus size={18} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-48 flex-col gap-2 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 p-1.5 text-gray-200 shadow-2xl backdrop-blur-md"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ActionDialog
            isFolder={true}
            trigger={
              <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-800 focus:bg-gray-800 focus:outline-none">
                <FolderPlus size={16} />
                New folder
              </button>
            }
            title="New folder"
            description="Enter a name for your new folder."
            submitLabel="Create"
            onSubmit={async (name) => {
              await createFolder(name, currentFolderId);
            }}
          />
          <div className="group relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-800 focus:bg-gray-800 focus:outline-none">
            <Upload size={16} className="shrink-0" />
            <span className="truncate">Upload file</span>
            <div className="opacity-0.001 absolute inset-0">
              <UploadButton
                endpoint="driveUploader"
                appearance={{
                  button: {
                    width: "100%",
                    height: "100%",
                    opacity: 0.001,
                  },
                  allowedContent: { display: "none" },
                }}
                onUploadProgress={(p) => setUploadProgress(p)}
                onUploadBegin={() => setUploadProgress(0)}
                onClientUploadComplete={() => {
                  setUploadProgress(null);
                  navigate.refresh();
                }}
                onUploadError={(error) => {
                  setUploadProgress(null);
                  console.error("Upload failed", error);
                }}
                input={{ folderId: currentFolderId }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
