"use client";

import { X } from "lucide-react";
import { useProgress } from "~/hooks/use-progress";
import { Progress } from "~/components/ui/progress";

export function GlobalProgress() {
  const {
    isProcessing,
    type,
    processedCount,
    totalCount,
    abortController,
    resetProcess,
  } = useProgress();

  if (!isProcessing) return null;

  const value = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
    }
    resetProcess();
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col">
      <Progress
        value={value}
        className="h-1.5 w-full rounded-none bg-teal-950 [&>div]:bg-teal-500"
      />
      <div className="mx-auto mt-2 flex w-fit items-center gap-4 rounded-lg border border-gray-700 bg-gray-900/90 px-4 py-2 text-sm text-gray-200 shadow-xl backdrop-blur-md">
        <span>
          {type === "upload" ? "Uploading" : "Downloading"}: {processedCount} /{" "}
          {totalCount} files
        </span>
        <button
          onClick={handleAbort}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-red-900/50 text-red-400 transition-colors hover:bg-red-900 hover:text-red-300"
          aria-label="Cancel process"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
