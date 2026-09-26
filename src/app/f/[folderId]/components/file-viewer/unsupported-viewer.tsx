"use client";

import type { DBFileType } from "~/server/db/schema";
import { getExtension } from "~/lib/file-kind";
import { ViewerMessage } from "./viewer-message";

export function UnsupportedViewer({ file }: { file: DBFileType }) {
  const ext = getExtension(file.name);

  return (
    <ViewerMessage
      file={file}
      description={
        ext
          ? `Preview isn't available for .${ext} files. You can download it or open it in a new tab.`
          : "Preview isn't available for this file. You can download it or open it in a new tab."
      }
    />
  );
}
