"use client";

import { useEffect, useRef } from "react";
import { Loader2, Play } from "lucide-react";
import type { DBFileType } from "~/server/db/schema";
import { getExtension } from "~/lib/file-kind";
import { MediaControls } from "./media-controls";
import { useMediaController } from "./use-media-controller";
import { ViewerMessage } from "./viewer-message";

export function VideoViewer({ file }: { file: DBFileType }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const media = useMediaController(videoRef);

  const { toggle, skip, setVolume, toggleMute } = media;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const el = videoRef.current;
      if (!el) return;

      if (e.key === " " || e.key === "k") toggle();
      else if (e.key === "ArrowRight") skip(5);
      else if (e.key === "ArrowLeft") skip(-5);
      else if (e.key === "ArrowUp") setVolume(el.volume + 0.1);
      else if (e.key === "ArrowDown") setVolume(el.volume - 0.1);
      else if (e.key === "m") toggleMute();
      else return;

      e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, skip, setVolume, toggleMute]);

  if (media.failed) {
    return (
      <ViewerMessage
        file={file}
        description={`This .${getExtension(file.name)} file can't be played here — your browser doesn't support its codec or container. Download it to watch in a media player.`}
      />
    );
  }

  const fullscreen = () => void containerRef.current?.requestFullscreen?.();

  return (
    <div ref={containerRef} className="flex h-full flex-col bg-black">
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onClick={toggle}
        onDoubleClick={fullscreen}
      >
        <video
          ref={videoRef}
          src={file.url}
          playsInline
          className="max-h-full max-w-full"
        />

        {media.waiting && (
          <Loader2
            className="pointer-events-none absolute animate-spin text-white/70"
            size={32}
          />
        )}

        {!media.playing && !media.waiting && (
          <div className="pointer-events-none absolute flex h-16 w-16 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/20 backdrop-blur-sm">
            <Play size={26} fill="white" className="ml-1 text-white" />
          </div>
        )}
      </div>

      <div className="shrink-0 p-3">
        <MediaControls media={media} onFullscreen={fullscreen} />
      </div>
    </div>
  );
}
