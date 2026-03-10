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
  DialogOverlay,
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
        <Button className="cursor-pointer rounded-md bg-gray-700 text-gray-100 hover:bg-gray-600 hover:text-gray-100">
          New folder
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden rounded-2xl border-gray-700 bg-gray-900 p-0 text-gray-100 sm:max-w-sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await createFolder(newFolderName || "New folder", currentFolderId);
            setIsOpen(false);
            setNewFolderName("");
          }}
        >
          <DialogHeader className="p-6 text-left">
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 pb-4">
            <div className="grid gap-2 text-gray-100">
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder"
                className="border-gray-700 bg-gray-800"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="m-0 mt-2 flex-row border-t border-gray-700 bg-gray-800 px-6 py-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-md border-none bg-gray-700 text-gray-100 hover:bg-gray-600 hover:text-gray-100"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="cursor-pointer rounded-md bg-blue-800 text-gray-100 hover:bg-blue-700 hover:text-gray-100"
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
