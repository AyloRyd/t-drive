"use client";

import { Download, ExternalLink } from "lucide-react";
import type { DBFileType } from "~/server/db/schema";
import { formatSize } from "~/lib/utils";
import { FileIcon } from "../file-icon";

/**
 * Centred fallback pane. Used for file types that have no viewer, and as the
 * error state for every viewer that fails to render its file.
 */
export function ViewerMessage({
  file,
  description,
}: {
  file: DBFileType;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800/60 ring-1 ring-gray-700/50">
        <FileIcon type="file" name={file.name} size={30} />
      </div>

      <div className="flex w-full flex-col gap-1">
        <h3
          className="truncate text-sm font-medium text-gray-100"
          title={file.name}
        >
          {file.name}
        </h3>
        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
      </div>

      <p className="max-w-xs text-sm leading-relaxed text-gray-400">
        {description}
      </p>

      <div className="mt-1 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
        <a
          href={`/api/download/file?fileId=${file.id}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 ring-1 ring-gray-700 transition-colors hover:bg-gray-700 hover:text-white"
        >
          <Download size={15} />
          Download
        </a>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 ring-1 ring-gray-700 transition-colors hover:bg-gray-700 hover:text-white"
        >
          <ExternalLink size={15} />
          Open in new tab
        </a>
      </div>
    </div>
  );
}
