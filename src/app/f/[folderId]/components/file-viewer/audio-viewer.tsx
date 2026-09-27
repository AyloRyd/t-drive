"use client";

import { useRef } from "react";
import type { DBFileType } from "~/server/db/schema";
import { getExtension } from "~/lib/file-kind";
import { formatSize } from "~/lib/utils";
import { FileIcon } from "../file-icon";
import { MediaControls } from "./media-controls";
import { useMediaController } from "./use-media-controller";
import { ViewerMessage } from "./viewer-message";

export function AudioViewer({ file }: { file: DBFileType }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const media = useMediaController(audioRef);

  if (media.failed) {
    return (
      <ViewerMessage
        file={file}
        description={`This .${getExtension(file.name)} file can't be played here — your browser doesn't support its codec. Download it to listen in a media player.`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800/60 ring-1 ring-gray-700/50">
        <FileIcon type="file" name={file.name} size={30} />
      </div>

      <div className="flex w-full flex-col gap-1 text-center">
        <h3
          className="truncate text-sm font-medium text-gray-100"
          title={file.name}
        >
          {file.name}
        </h3>
        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
      </div>

      <audio ref={audioRef} src={file.url} preload="metadata" />
      <MediaControls media={media} className="w-full" />
    </div>
  );
}
