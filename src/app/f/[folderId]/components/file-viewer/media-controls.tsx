"use client";

import { useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatDuration } from "~/lib/utils";
import type { MediaController } from "./use-media-controller";

export function MediaControls({
  media,
  onFullscreen,
  isFullscreen = false,
  className = "",
}: {
  media: MediaController;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  className?: string;
}) {
  // Open state is tracked rather than left to :hover so a drag that strays
  // off the row cannot collapse the slider out from under the pointer.
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volumeDragging, setVolumeDragging] = useState(false);

  const VolumeIcon = media.muted
    ? VolumeX
    : media.volume > 0.5
      ? Volume2
      : Volume1;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-900/90 px-3 py-2 backdrop-blur-md ${className}`}
    >
      <IconButton
        label={media.playing ? "Pause" : "Play"}
        onClick={media.toggle}
        accent
      >
        {media.playing ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" />
        )}
      </IconButton>

      <span className="shrink-0 font-mono text-xs text-gray-400 tabular-nums">
        {formatDuration(media.currentTime)}
      </span>

      <Scrubber
        value={media.currentTime}
        max={media.duration}
        buffered={media.buffered}
        onChange={media.seek}
        label="Seek"
      />

      <span className="shrink-0 font-mono text-xs text-gray-500 tabular-nums">
        {formatDuration(media.duration)}
      </span>

      <div
        className="flex shrink-0 items-center"
        onPointerEnter={() => setVolumeOpen(true)}
        onPointerLeave={() => !volumeDragging && setVolumeOpen(false)}
        onFocus={() => setVolumeOpen(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setVolumeOpen(false);
        }}
      >
        <IconButton
          label={media.muted ? "Unmute" : "Mute"}
          onClick={media.toggleMute}
        >
          <VolumeIcon size={16} />
        </IconButton>
        <div
          className={`overflow-hidden transition-[width] ${
            volumeOpen || volumeDragging ? "w-20" : "w-0"
          }`}
        >
          <div className="pl-1">
            <Scrubber
              value={media.muted ? 0 : media.volume}
              max={1}
              onChange={media.setVolume}
              onDragChange={setVolumeDragging}
              label="Volume"
            />
          </div>
        </div>
      </div>

      {onFullscreen && (
        <IconButton
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={onFullscreen}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </IconButton>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  accent,
  children,
}: {
  label: string;
  onClick: () => void;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${
        accent
          ? "bg-teal-500 text-gray-950 hover:bg-teal-400"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** Diameter of the scrubber thumb, in px — must match its `h-3 w-3`. */
const THUMB_SIZE = 12;

/** Draggable bar used for both the timeline and the volume. */
function Scrubber({
  value,
  max,
  buffered = 0,
  onChange,
  onDragChange,
  label,
}: {
  value: number;
  max: number;
  buffered?: number;
  onChange: (value: number) => void;
  onDragChange?: (dragging: boolean) => void;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setDragging = (next: boolean) => {
    dragging.current = next;
    onDragChange?.(next);
  };

  const pick = (clientX: number) => {
    const el = trackRef.current;
    if (!el || max <= 0) return;
    const rect = el.getBoundingClientRect();
    // A collapsed track would make the ratio Infinity and slam the value to
    // an end stop, so ignore reads taken while it has no width.
    if (rect.width === 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(ratio * max);
  };

  const ratio = (n: number) =>
    max > 0 ? Math.max(0, Math.min(1, n / max)) : 0;
  const pct = (n: number) => `${ratio(n) * 100}%`;

  // The thumb is centred on its position, so at either end half of it would
  // sit outside the rail. Insetting its travel by half its width keeps it
  // within bounds while the fill still spans the full rail.
  const thumbLeft = `calc(${ratio(value) * 100}% + ${
    THUMB_SIZE / 2 - ratio(value) * THUMB_SIZE
  }px)`;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={(e) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && pick(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(e) => {
        const step = max > 1 ? 5 : 0.05;
        if (e.key === "ArrowRight") onChange(Math.min(max, value + step));
        else if (e.key === "ArrowLeft") onChange(Math.max(0, value - step));
        else return;
        e.preventDefault();
      }}
      className="group/bar relative flex h-4 w-full min-w-0 flex-1 cursor-pointer items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
    >
      <div className="relative h-1.5 w-full rounded-full bg-gray-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gray-600"
          style={{ width: pct(buffered) }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-teal-500"
          style={{ width: pct(value) }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 rounded-full bg-teal-400 opacity-0 transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100"
          // Centred inline: the -translate-*-1/2 utilities resolve to 0 here,
          // which left the thumb half its size low and to the right.
          style={{ left: thumbLeft, transform: "translate(-50%, -50%)" }}
        />
      </div>
    </div>
  );
}
