"use client";

import { useSyncExternalStore } from "react";
import type { DBFileType } from "~/server/db/schema";
import { ViewerMessage } from "./viewer-message";

/**
 * iOS and iPadOS render only the first page of a PDF inside an iframe, so
 * those devices get the fallback pane and open the file in a tab instead.
 * iPadOS reports itself as a Mac, hence the touch-point check.
 */
function isIOS() {
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

/** The platform never changes mid-session, so there is nothing to subscribe to. */
const neverChanges = () => () => undefined;

export function PdfViewer({ file }: { file: DBFileType }) {
  const embeddable = useSyncExternalStore(
    neverChanges,
    () => !isIOS(),
    () => true,
  );

  if (!embeddable) {
    return (
      <ViewerMessage
        file={file}
        description="Your browser can only show the first page of a PDF here. Open it in a new tab to read the whole document."
      />
    );
  }

  return (
    <iframe
      src={file.url}
      title={file.name}
      className="h-full w-full rounded-lg border-0 bg-white"
    />
  );
}
