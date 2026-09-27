"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useUploadError } from "~/hooks/use-upload-error";

export function UploadErrorDialog() {
  const error = useUploadError((state) => state.error);
  const clearUploadError = useUploadError((state) => state.clearUploadError);

  return (
    <Dialog
      open={error !== null}
      onOpenChange={(open) => !open && clearUploadError()}
    >
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 p-0 text-gray-100 shadow-2xl backdrop-blur-md sm:max-w-sm"
      >
        <DialogHeader className="min-w-0 px-6 pt-6 pb-4 text-left">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle size={20} />
          </div>
          <DialogTitle>{error?.title ?? "Upload failed"}</DialogTitle>
          <DialogDescription className="break-words text-gray-400">
            {error?.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2 border-t border-gray-800 bg-gray-800 p-4 sm:justify-end">
          <DialogClose asChild>
            <Button className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 text-gray-200 transition-colors hover:bg-gray-700">
              Got it
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
