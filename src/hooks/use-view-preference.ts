import { useSyncExternalStore } from "react";

const STORE_KEY = "drive-view-preference";

function getStoredView(): "list" | "grid" {
  const stored = localStorage.getItem(STORE_KEY);
  return stored === "list" || stored === "grid" ? stored : "list";
}

function subscribe(callback: () => void) {
  const controller = new AbortController();
  const { signal } = controller;

  window.addEventListener("storage", callback, { signal });
  window.addEventListener("local-storage", callback, { signal });

  return () => controller.abort();
}

export function useViewPreference() {
  const view = useSyncExternalStore(
    subscribe,
    getStoredView,
    () => "list" as const,
  );

  const setView = (newView: "list" | "grid") => {
    localStorage.setItem(STORE_KEY, newView);
    window.dispatchEvent(new Event("local-storage"));
  };

  return [view, setView] as const;
}
