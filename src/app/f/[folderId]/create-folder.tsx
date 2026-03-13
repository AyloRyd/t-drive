"use client";

import { Plus } from "lucide-react";
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
import { createFolder } from "~/server/actions";

export function CreateFolder({ currentFolderId }: { currentFolderId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <li className="flex cursor-pointer items-center justify-center gap-4 px-6 py-4 text-gray-400 transition-colors hover:bg-gray-700/50">
          <Plus size={20} />
          New folder
        </li>
      </DialogTrigger>
      <DialogContent className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 p-0 text-gray-100 shadow-2xl backdrop-blur-md sm:max-w-sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await createFolder(newFolderName || "New folder", currentFolderId);
            setIsOpen(false);
            setNewFolderName("");
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 text-left">
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Input
              id="folder-name"
              value={newFolderName}
              required
              onChange={(e) => setNewFolderName(e.target.value)}
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
