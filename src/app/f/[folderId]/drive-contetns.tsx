"use client";

import { ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-row";
import type { DB_FileType, DB_FolderType } from "~/server/db/schema";
import Link from "next/link";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function DriveContents(props: {
  files: DB_FileType[];
  folders: DB_FolderType[];
  parents: DB_FolderType[];
  currentFolderId: number;
}) {
  const navigate = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="mr-2 cursor-pointer font-semibold text-gray-100"
            >
              T-Drive
            </Link>
            {props.parents.map(
              (folder) =>
                folder && (
                  <div key={folder.id} className="flex items-center">
                    <ChevronRight className="mx-2 text-gray-500" size={16} />
                    <Link
                      href={`/f/${folder.id}`}
                      className="cursor-pointer text-gray-400 transition-colors hover:text-gray-100"
                    >
                      {folder.name}
                    </Link>
                  </div>
                ),
            )}
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton>
                <Button
                  variant="secondary"
                  className="cursor-pointer rounded-md"
                >
                  Sign In
                </Button>
              </SignInButton>
            </Show>

            <ClerkLoading>
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
            </ClerkLoading>
            <ClerkLoaded>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </ClerkLoaded>
          </div>
        </div>
        <div className="rounded-t-lg bg-gray-800">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-3">Size</div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </ul>
        </div>
        <UploadButton
          endpoint="driveUploader"
          className="ut-button:bg-red-500 ut-button:ut-readying:bg-red-500/50 mt-8"
          onClientUploadComplete={() => {
            navigate.refresh();
          }}
          input={{
            folderId: props.currentFolderId,
          }}
        />
      </div>
    </div>
  );
}
