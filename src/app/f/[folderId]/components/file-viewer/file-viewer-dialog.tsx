"use client";

import dynamic from "next/dynamic";
import { Download, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useFileViewer } from "~/hooks/use-file-viewer";
import {
  getViewerKind,
  isCompactViewer,
  type ViewerKind,
} from "~/lib/file-kind";
import type { DBFileType } from "~/server/db/schema";
import { FileIcon } from "../file-icon";
import { ViewerSkeleton } from "./code-block";
import { UnsupportedViewer } from "./unsupported-viewer";

type ViewerProps = { file: DBFileType };

/**
 * Split out of the drive bundle: a viewer only loads once a file of that
 * kind is actually opened.
 */
const VIEWERS: Record<ViewerKind, React.ComponentType<ViewerProps>> = {
  image: dynamic(() => import("./image-viewer").then((m) => m.ImageViewer), {
    loading: ViewerSkeleton,
  }),
  pdf: dynamic(() => import("./pdf-viewer").then((m) => m.PdfViewer), {
    loading: ViewerSkeleton,
  }),
  markdown: dynamic(
    () => import("./markdown-viewer").then((m) => m.MarkdownViewer),
    { loading: ViewerSkeleton },
  ),
  code: dynamic(() => import("./text-viewer").then((m) => m.TextViewer), {
    loading: ViewerSkeleton,
  }),
  text: dynamic(() => import("./text-viewer").then((m) => m.TextViewer), {
    loading: ViewerSkeleton,
  }),
  video: dynamic(() => import("./video-viewer").then((m) => m.VideoViewer), {
    loading: ViewerSkeleton,
  }),
  audio: dynamic(() => import("./audio-viewer").then((m) => m.AudioViewer), {
    loading: ViewerSkeleton,
  }),
};

export function FileViewerDialog() {
  const file = useFileViewer((state) => state.file);
  const closeViewer = useFileViewer((state) => state.closeViewer);

  // Placeholders and audio have nothing to scroll, so they get a small
  // self-sized dialog rather than a mostly-empty full-height one.
  const compact = file === null || isCompactViewer(getViewerKind(file.name));

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && closeViewer()}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className={`flex flex-col gap-0 overflow-hidden border border-gray-700/50 bg-gray-900 p-0 text-gray-100 ${
          // No height class in the compact case: the dialog is fixed inset-0
          // with m-auto, so only the base h-fit keeps it shrunk to content.
          compact ? "sm:max-w-md" : "h-[85vh] sm:max-w-5xl"
        }`}
      >
        {file && <ViewerBody key={file.id} file={file} />}
      </DialogContent>
    </Dialog>
  );
}

function ViewerBody({ file }: ViewerProps) {
  const kind = getViewerKind(file.name);
  const Viewer = kind ? VIEWERS[kind] : UnsupportedViewer;

  return (
    <>
      <DialogHeader className="flex-row items-center gap-1 border-b border-gray-700/50 py-3 pr-2 pl-4">
        <FileIcon type="file" name={file.name} size={18} />
        <DialogTitle
          className="mr-2 min-w-0 flex-1 truncate text-sm font-medium"
          title={file.name}
        >
          {file.name}
        </DialogTitle>
        <a
          href={`/api/download/file?fileId=${file.id}`}
          aria-label="Download"
          title="Download"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <Download size={16} />
        </a>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in new tab"
          title="Open in new tab"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <ExternalLink size={16} />
        </a>
        <DialogClose
          aria-label="Close"
          title="Close"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <X size={16} />
        </DialogClose>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Viewer file={file} />
      </div>
    </>
  );
}
