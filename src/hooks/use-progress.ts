import { create } from "zustand";

interface ProgressState {
  isProcessing: boolean;
  type: "upload" | "download" | null;
  processedCount: number;
  totalCount: number;
  abortController: AbortController | null;
  startProcess: (
    type: "upload" | "download",
    totalCount: number,
    controller: AbortController,
  ) => void;
  updateProgress: (processedCount: number) => void;
  finishProcess: () => void;
  resetProcess: () => void;
  incrementProgress: () => void;
}

export const useProgress = create<ProgressState>((set) => ({
  isProcessing: false,
  type: null,
  processedCount: 0,
  totalCount: 0,
  abortController: null,
  startProcess: (type, totalCount, abortController) =>
    set({
      isProcessing: true,
      type,
      processedCount: 0,
      totalCount,
      abortController,
    }),
  updateProgress: (processedCount) => set({ processedCount }),
  incrementProgress: () =>
    set((state) => ({ processedCount: state.processedCount + 1 })),
  finishProcess: () =>
    set({
      isProcessing: false,
      type: null,
      processedCount: 0,
      totalCount: 0,
      abortController: null,
    }),
  resetProcess: () =>
    set({
      isProcessing: false,
      type: null,
      processedCount: 0,
      totalCount: 0,
      abortController: null,
    }),
}));
