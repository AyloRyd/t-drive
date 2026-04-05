"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFiles } from "~/components/uploadthing";
import { Upload } from "lucide-react";
import { useProgress } from "~/hooks/use-progress";

interface DriveDropzoneProps {
  children: React.ReactNode;
  currentFolderId: string;
}

export function DriveDropzone({
  children,
  currentFolderId,
}: DriveDropzoneProps) {
  const navigate = useRouter();
  const { startProcess, incrementProgress, finishProcess } = useProgress();

  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      const ctrl = new AbortController();
      startProcess("upload", files.length, ctrl);

      try {
        for (const file of files) {
          if (ctrl.signal.aborted) break;

          await uploadFiles("driveUploader", {
            files: [file],
            input: { folderId: currentFolderId },
          });

          incrementProgress();
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        if (!ctrl.signal.aborted) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          finishProcess();
        }
        navigate.refresh();
      }
    }
  };

  return (
    <div
      className="relative h-full w-full"
      onDragEnter={() => setIsDragging(true)}
    >
      {isDragging && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
        >
          <div className="pointer-events-none flex flex-col items-center rounded-xl border-4 border-dashed border-teal-500 bg-gray-900/50 p-12 text-center shadow-2xl">
            <div className="rounded-full bg-teal-500/20 p-6 shadow-2xl shadow-teal-500/20">
              <Upload className="h-16 w-16 text-teal-400" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">
              Drop your files here
            </h2>
            <p className="mt-2 text-gray-400">
              Files will be uploaded to the current folder
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
