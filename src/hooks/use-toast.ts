import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  /** Emphasised lead-in, e.g. a file name; truncated if long. */
  subject?: string;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toast: Toast | null;
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
}

let nextId = 1;

/** One toast at a time: a new one replaces whatever is showing. */
export const useToast = create<ToastState>((set) => ({
  toast: null,
  showToast: (toast) => set({ toast: { ...toast, id: nextId++ } }),
  dismissToast: (id) =>
    set((state) => (state.toast?.id === id ? { toast: null } : state)),
}));
