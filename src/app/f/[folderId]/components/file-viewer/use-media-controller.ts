"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export interface MediaState {
  playing: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  waiting: boolean;
  failed: boolean;
}

const INITIAL: MediaState = {
  playing: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 1,
  muted: false,
  waiting: true,
  failed: false,
};

/** Events after which the whole snapshot is worth re-reading. */
const SYNC_EVENTS = [
  "loadedmetadata",
  "durationchange",
  "timeupdate",
  "progress",
  "play",
  "pause",
  "ended",
  "seeked",
  "volumechange",
];

/**
 * Mirrors a <video>/<audio> element's state into React so the controls can be
 * ours rather than the browser's. The element stays the source of truth.
 */
export function useMediaController(ref: RefObject<HTMLMediaElement | null>) {
  const [state, setState] = useState<MediaState>(INITIAL);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = () =>
      setState((s) => ({
        ...s,
        playing: !el.paused && !el.ended,
        currentTime: el.currentTime,
        duration: Number.isFinite(el.duration) ? el.duration : 0,
        buffered: el.buffered.length
          ? el.buffered.end(el.buffered.length - 1)
          : 0,
        volume: el.volume,
        muted: el.muted,
      }));

    const onWaiting = () => setState((s) => ({ ...s, waiting: true }));
    const onReady = () => {
      setState((s) => ({ ...s, waiting: false }));
      sync();
    };
    const onError = () => setState((s) => ({ ...s, failed: true }));

    for (const name of SYNC_EVENTS) el.addEventListener(name, sync);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onReady);
    el.addEventListener("playing", onReady);
    el.addEventListener("error", onError);

    // The element starts loading during render, so it can already have failed
    // (undecodable container) or be ready (cached) before these listeners
    // exist. The microtask keeps that catch-up read out of the effect body.
    queueMicrotask(() => {
      if (el.error) onError();
      else if (el.readyState > 0) onReady();
    });

    return () => {
      for (const name of SYNC_EVENTS) el.removeEventListener(name, sync);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("playing", onReady);
      el.removeEventListener("error", onError);
    };
  }, [ref]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setState((s) => ({ ...s, failed: true })));
    } else {
      el.pause();
    }
  }, [ref]);

  const seek = useCallback(
    (time: number) => {
      const el = ref.current;
      if (!el) return;
      el.currentTime = Math.max(0, Math.min(el.duration || 0, time));
    },
    [ref],
  );

  const skip = useCallback(
    (delta: number) => {
      const el = ref.current;
      if (el) seek(el.currentTime + delta);
    },
    [ref, seek],
  );

  const setVolume = useCallback(
    (volume: number) => {
      const el = ref.current;
      if (!el) return;
      el.volume = Math.max(0, Math.min(1, volume));
      el.muted = el.volume === 0;
    },
    [ref],
  );

  const toggleMute = useCallback(() => {
    const el = ref.current;
    if (el) el.muted = !el.muted;
  }, [ref]);

  return { ...state, toggle, seek, skip, setVolume, toggleMute };
}

export type MediaController = ReturnType<typeof useMediaController>;
