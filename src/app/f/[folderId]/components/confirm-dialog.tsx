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

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => Promise<void>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  actionLabel,
  onAction,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 p-0 text-gray-100 shadow-2xl backdrop-blur-md sm:max-w-sm"
      >
        <DialogHeader className="px-6 pt-6 pb-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
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
            className="cursor-pointer rounded-lg border border-red-900 bg-red-900 text-white transition-colors hover:bg-red-800"
            onClick={async () => {
              await onAction();
              setIsOpen(false);
            }}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
