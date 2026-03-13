"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

interface FolderDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  submitLabel: string;
  defaultValue?: string;
  onSubmit: (name: string) => Promise<void>;
}

export function FolderDialog({
  trigger,
  title,
  description,
  submitLabel,
  defaultValue = "",
  onSubmit,
}: FolderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [folderName, setFolderName] = useState(defaultValue);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) setFolderName(defaultValue);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 p-0 text-gray-100 shadow-2xl backdrop-blur-md sm:max-w-sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit(folderName || defaultValue || "New folder");
            setIsOpen(false);
            setFolderName(defaultValue);
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Input
              id="folder-name"
              value={folderName}
              required
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="E.g., Vacation Photos"
              className="border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus-visible:ring-gray-600"
              autoFocus
            />
          </div>
          <DialogFooter className="flex-row justify-end gap-2 border-t border-gray-800 bg-gray-800 p-4 sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-800 hover:text-gray-300"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer rounded-lg border border-gray-700 bg-gray-700 text-white transition-colors hover:bg-gray-600"
              type="submit"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
