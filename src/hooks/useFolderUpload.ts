import { useRouter } from "next/navigation";
import { uploadFiles } from "~/components/uploadthing";
import { cleanupAbortedUpload } from "~/server/actions/file.actions";
import { createFolderStructure } from "~/server/actions/folder.actions";
import { useProgress } from "./use-progress";

export function useFolderUpload(currentFolderId: string) {
  const navigate = useRouter();
  const { startProcess, incrementProgress, finishProcess } = useProgress();

  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

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
      const { idMap, error } = await createFolderStructure(
        Array.from(paths),
        currentFolderId,
      );
      if (error || !idMap) throw new Error(error || "Failed to create folders");

      const groupedFiles = new Map<string, File[]>();
      for (const file of fileArray) {
        const parts = file.webkitRelativePath.split("/");
        parts.pop();
        const folderPath = parts.join("/");
        const targetId = idMap[folderPath];
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
      }
    } finally {
      if (!ctrl.signal.aborted) finishProcess();
      navigate.refresh();
      e.target.value = "";
    }
  };
}
