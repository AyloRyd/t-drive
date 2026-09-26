"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { DBFileType } from "~/server/db/schema";
import { ViewerMessage } from "./viewer-message";

export function ImageViewer({ file }: { file: DBFileType }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );

  if (status === "failed") {
    return (
      <ViewerMessage
        file={file}
        description="This image couldn't be displayed. It may be corrupted or use a format your browser doesn't support."
      />
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-auto p-4">
      {status === "loading" && (
        <Loader2 className="absolute animate-spin text-gray-600" size={28} />
      )}
      {/* Plain <img>: these are arbitrary user uploads on a remote CDN, and
          routing every one through the Next image optimizer buys nothing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={file.url}
        alt={file.name}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
        className={`max-h-full max-w-full object-contain transition-opacity ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
