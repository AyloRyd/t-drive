import { create } from "zustand";
import type { UploadRejection } from "~/lib/upload";

interface UploadErrorState {
  error: UploadRejection | null;
  showUploadError: (error: UploadRejection) => void;
  clearUploadError: () => void;
}

export const useUploadError = create<UploadErrorState>((set) => ({
  error: null,
  showUploadError: (error) => set({ error }),
  clearUploadError: () => set({ error: null }),
}));
