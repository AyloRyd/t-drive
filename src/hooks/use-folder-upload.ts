import { useRouter } from "next/navigation";
import { uploadFiles } from "~/components/uploadthing";
import { cleanupAbortedUpload } from "~/server/actions/file.actions";
import { createFolderStructure } from "~/server/actions/folder.actions";
import { checkUploadSizes } from "~/lib/upload";
import { useProgress } from "./use-progress";
import { useUploadError } from "./use-upload-error";

export function useFolderUpload(currentFolderId: string) {
  const navigate = useRouter();
  const { startProcess, incrementProgress, finishProcess } = useProgress();
  const showUploadError = useUploadError((state) => state.showUploadError);

  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { allowed: fileArray, rejection } = checkUploadSizes(
      Array.from(files),
    );
    if (rejection) showUploadError(rejection);
    if (fileArray.length === 0) {
      e.target.value = "";
      return;
    }

    const paths = new Set<string>();
    for (const file of fileArray) {
      const parts = file.webkitRelativePath.split("/");
      parts.pop();
      paths.add(parts.join("/"));
    }

    const ctrl = new AbortController();
    startProcess("upload", fileArray.length, ctrl);

    const uploadedFileIds: string[] = [];

    try {
      const folderResult = await createFolderStructure(
        Array.from(paths),
        currentFolderId,
      );
      if (!folderResult.success) {
        throw new Error(folderResult.error);
      }

      const groupedFiles = new Map<string, File[]>();
      for (const file of fileArray) {
        const parts = file.webkitRelativePath.split("/");
        parts.pop();
        const folderPath = parts.join("/");
        const targetId = folderResult.data.idMap[folderPath];
        if (!targetId) throw new Error(`Missing ID for path ${folderPath}`);

        if (!groupedFiles.has(targetId)) groupedFiles.set(targetId, []);
        groupedFiles.get(targetId)!.push(file);
      }

      for (const [targetId, group] of groupedFiles.entries()) {
        if (ctrl.signal.aborted) break;

        for (const file of group) {
          if (ctrl.signal.aborted) break;

          const uploaded = await uploadFiles("driveUploader", {
            files: [file],
            input: { folderId: targetId },
          });

          if (uploaded?.[0]?.serverData?.fileId) {
            uploadedFileIds.push(uploaded[0].serverData.fileId);
          }

          incrementProgress();
        }
      }

      if (ctrl.signal.aborted) {
        await cleanupAbortedUpload(uploadedFileIds);
      }
    } catch (err) {
      console.error(err);
      if (ctrl.signal.aborted) {
        await cleanupAbortedUpload(uploadedFileIds);
      } else {
        showUploadError({
          title: "Upload failed",
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong while uploading.",
        });
      }
    } finally {
      if (!ctrl.signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        finishProcess();
      }
      navigate.refresh();
      e.target.value = "";
    }
  };
}
