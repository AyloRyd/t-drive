import { useRef } from "react";
import { useRouter } from "next/navigation";
import { checkUploadSizes } from "~/lib/upload";
import { useProgress } from "./use-progress";
import { useUploadError } from "./use-upload-error";

export function useFileUpload() {
  const navigate = useRouter();
  const { startProcess, updateProgress, finishProcess } = useProgress();
  const showUploadError = useUploadError((state) => state.showUploadError);
  const totalRef = useRef(0);

  return {
    onBeforeUploadBegin: (files: File[]) => {
      const { allowed, rejection } = checkUploadSizes(files);
      if (rejection) showUploadError(rejection);

      totalRef.current = allowed.length;
      if (allowed.length > 0) startProcess("upload", allowed.length, null);
      return allowed;
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
      showUploadError({ title: "Upload failed", message: error.message });
    },
  };
}
