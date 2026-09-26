import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "./use-progress";

export function useFileUpload() {
  const navigate = useRouter();
  const { startProcess, updateProgress, finishProcess } = useProgress();
  const totalRef = useRef(0);

  return {
    onBeforeUploadBegin: (files: File[]) => {
      totalRef.current = files.length;
      startProcess("upload", files.length, null);
      return files;
    },
    onUploadProgress: (p: number) => {
      updateProgress((p / 100) * totalRef.current);
    },
    onClientUploadComplete: () => {
      updateProgress(totalRef.current);
      setTimeout(() => {
        finishProcess();
        navigate.refresh();
      }, 500);
    },
    onUploadError: (error: Error) => {
      finishProcess();
      console.error("Upload failed", error);
    },
  };
}
