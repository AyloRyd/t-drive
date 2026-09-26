"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Maximize2, Minus, Plus } from "lucide-react";
import type { DBFileType } from "~/server/db/schema";
import { ViewerMessage } from "./viewer-message";

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const STEP = 1.25;

/** Scale 1 is the image fitted to the pane, not its natural pixel size. */
type View = { scale: number; x: number; y: number };

const FIT: View = { scale: 1, x: 0, y: 0 };

function clamp(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function ImageViewer({ file }: { file: DBFileType }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  const [view, setView] = useState<View>(FIT);
  const containerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ x: number; y: number } | null>(null);
  const [panning, setPanning] = useState(false);

  /** Zooms so the point under `client` stays put; centred when omitted. */
  const zoom = useCallback(
    (factor: number, client?: { x: number; y: number }) => {
      const rect = containerRef.current?.getBoundingClientRect();
      setView((v) => {
        const scale = clamp(v.scale * factor);
        if (scale === v.scale) return v;

        const px = client && rect ? client.x - rect.left - rect.width / 2 : 0;
        const py = client && rect ? client.y - rect.top - rect.height / 2 : 0;
        const ratio = scale / v.scale;

        return {
          scale,
          x: px - (px - v.x) * ratio,
          y: py - (py - v.y) * ratio,
        };
      });
    },
    [],
  );

  // Registered by hand because React's onWheel is passive, so it cannot
  // preventDefault the browser's own page zoom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? STEP : 1 / STEP, { x: e.clientX, y: e.clientY });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoom(STEP);
      else if (e.key === "-") zoom(1 / STEP);
      else if (e.key === "0") setView(FIT);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoom]);

  if (status === "failed") {
    return (
      <ViewerMessage
        file={file}
        description="This image couldn't be displayed. It may be corrupted or use a format your browser doesn't support."
      />
    );
  }

  const zoomed = view.scale !== 1 || view.x !== 0 || view.y !== 0;

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full touch-none items-center justify-center overflow-hidden ${
        panning ? "cursor-grabbing" : zoomed ? "cursor-grab" : "cursor-default"
      }`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        panRef.current = { x: e.clientX - view.x, y: e.clientY - view.y };
        setPanning(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const start = panRef.current;
        if (!start) return;
        setView((v) => ({ ...v, x: e.clientX - start.x, y: e.clientY - start.y }));
      }}
      onPointerUp={() => {
        panRef.current = null;
        setPanning(false);
      }}
      onPointerCancel={() => {
        panRef.current = null;
        setPanning(false);
      }}
      onDoubleClick={(e) =>
        zoomed ? setView(FIT) : zoom(STEP * STEP, { x: e.clientX, y: e.clientY })
      }
    >
      {status === "loading" && (
        <Loader2 className="absolute animate-spin text-gray-600" size={28} />
      )}

      {/* Plain <img>: these are arbitrary user uploads on a remote CDN, and
          routing every one through the Next image optimizer buys nothing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={file.url}
        alt={file.name}
        draggable={false}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("failed")}
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
        className={`max-h-full max-w-full object-contain transition-opacity ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />

      {status === "loaded" && (
        <div
          // The controls sit inside the pan surface, so their clicks must not
          // start a drag or trigger the double-click zoom underneath.
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 flex items-center gap-1 rounded-xl border border-gray-700/50 bg-gray-900/90 p-1 shadow-2xl backdrop-blur-md"
        >
          <ZoomButton
            label="Zoom out"
            onClick={() => zoom(1 / STEP)}
            disabled={view.scale <= MIN_SCALE}
          >
            <Minus size={16} />
          </ZoomButton>

          <button
            onClick={() => setView(FIT)}
            title="Reset to fit"
            className="min-w-14 cursor-pointer rounded-lg px-2 py-1.5 text-center font-mono text-xs text-gray-300 tabular-nums transition-colors hover:bg-gray-800 hover:text-white"
          >
            {Math.round(view.scale * 100)}%
          </button>

          <ZoomButton
            label="Zoom in"
            onClick={() => zoom(STEP)}
            disabled={view.scale >= MAX_SCALE}
          >
            <Plus size={16} />
          </ZoomButton>

          <div className="mx-0.5 h-5 w-px bg-gray-700" />

          <ZoomButton
            label="Fit to screen"
            onClick={() => setView(FIT)}
            disabled={!zoomed}
          >
            <Maximize2 size={15} />
          </ZoomButton>
        </div>
      )}
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
    >
      {children}
    </button>
  );
}
