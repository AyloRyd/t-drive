"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

const DURATION_MS = 6000;

export function Toaster() {
  const toast = useToast((state) => state.toast);
  const dismissToast = useToast((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dismissToast(toast.id), DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        key={toast.id}
        className="animate-in fade-in slide-in-from-bottom-2 pointer-events-auto flex max-w-full items-center gap-3 rounded-xl border border-gray-700/60 bg-gray-900/95 py-2.5 pr-2 pl-4 text-sm text-gray-200 shadow-2xl shadow-black/60 backdrop-blur-md"
      >
        <p className="flex min-w-0 items-center gap-1">
          {toast.subject && (
            <span className="max-w-[220px] truncate font-medium text-white">
              {toast.subject}
            </span>
          )}
          <span className="shrink-0">{toast.message}</span>
        </p>

        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              dismissToast(toast.id);
            }}
            className="shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold text-teal-400 transition-colors hover:bg-teal-500/10 hover:text-teal-300"
          >
            {toast.action.label}
          </button>
        )}

        <button
          onClick={() => dismissToast(toast.id)}
          aria-label="Dismiss"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
