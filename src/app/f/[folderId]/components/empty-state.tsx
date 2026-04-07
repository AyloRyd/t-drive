import { Folder, FolderUp, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActionDialog } from "./action-dialog";
import { UploadButton } from "~/components/uploadthing";
import { createFolder } from "~/server/actions/folder.actions";
import { useFolderUpload } from "~/hooks/use-folder-upload";
import { useProgress } from "~/hooks/use-progress";
import Image from "next/image";

export function EmptyState({ currentFolderId }: { currentFolderId: string }) {
  const navigate = useRouter();
  const uploadFolder = useFolderUpload(currentFolderId);
  const { startProcess, updateProgress, finishProcess } = useProgress();

  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24">
      <div className="mb-3 text-5xl">
        <Image src="/logo.png" alt="Logo" width={75} height={75} />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-gray-200">
        This folder is empty
      </h2>
      <p className="mb-8 max-w-sm text-center text-sm text-gray-400">
        Get started by creating a new folder or uploading files.
      </p>

      <div className="grid w-full max-w-lg grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:px-0">
        <ActionDialog
          isFolder={true}
          trigger={
            <button className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-800/40 px-4 py-6 transition-all hover:border-gray-600 hover:bg-gray-800/70 focus:outline-none">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20">
                <Folder size={22} />
              </div>
              <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
                New folder
              </span>
            </button>
          }
          title="New folder"
          description="Enter a name for your new folder."
          submitLabel="Create"
          onSubmit={async (name) => {
            await createFolder(name, currentFolderId);
          }}
        />
        <label className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-800/40 px-4 py-6 transition-all hover:border-gray-600 hover:bg-gray-800/70">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
            <FolderUp size={22} />
          </div>
          <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
            Upload folder
          </span>
          <input
            type="file"
            onChange={uploadFolder}
            className="hidden"
            // @ts-expect-error react types don't have webkitdirectory or directory
            webkitdirectory=""
            directory=""
            multiple
          />
        </label>
        <div className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-800/40 px-4 py-6 transition-all hover:border-gray-600 hover:bg-gray-800/70">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
            <Upload size={22} />
          </div>
          <span className="text-sm font-medium text-gray-300 transition-colors group-hover:text-white">
            Upload file
          </span>
          <div className="absolute inset-0 opacity-[0.001] [&>div]:h-full [&>div]:w-full">
            <UploadButton
              endpoint="driveUploader"
              appearance={{
                button: {
                  width: "100%",
                  height: "100%",
                  opacity: 0.001,
                },
                container: {
                  width: "100%",
                  height: "100%",
                },
                allowedContent: { display: "none" },
              }}
              onUploadProgress={(p) => {
                updateProgress(p / 100);
              }}
              onUploadBegin={() => {
                startProcess("upload", 1, null);
              }}
              onClientUploadComplete={() => {
                updateProgress(1);
                setTimeout(() => {
                  finishProcess();
                  navigate.refresh();
                }, 500);
              }}
              onUploadError={(error) => {
                finishProcess();
                console.error("Upload failed", error);
              }}
              input={{ folderId: currentFolderId }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
