import { create } from "zustand";
import type { DBFileType } from "~/server/db/schema";

interface FileViewerState {
  file: DBFileType | null;
  openViewer: (file: DBFileType) => void;
  closeViewer: () => void;
}

export const useFileViewer = create<FileViewerState>((set) => ({
  file: null,
  openViewer: (file) => set({ file }),
  closeViewer: () => set({ file: null }),
}));
