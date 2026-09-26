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
    <div className="flex h-full flex-col items-center justify-center gap-5 px-8 py-12 text-center">
      <FileIcon type="file" name={file.name} size={64} />

      <div className="flex max-w-md flex-col gap-1">
        <h3 className="truncate text-base font-medium text-gray-100">
          {file.name}
        </h3>
        <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
      </div>

      <p className="max-w-sm text-sm text-gray-400">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/api/download/file?fileId=${file.id}`}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 ring-1 ring-gray-700 transition-colors hover:bg-gray-700 hover:text-white"
        >
          <Download size={15} />
          Download
        </a>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <ExternalLink size={15} />
          Open in new tab
        </a>
      </div>
    </div>
  );
}
