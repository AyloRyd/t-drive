"use client";

import { ChevronRight, Plus } from "lucide-react";
import { FileRow, FolderRow } from "./drive-row";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import Link from "next/link";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading, Show, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { FolderDialog } from "./folder-dialog";
import { createFolder } from "~/server/actions/folder.actions";

export default function DriveContents(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  parents: DBFolderType[];
  currentFolderId: number;
  rootFolderId: number;
}) {
  const navigate = useRouter();
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 font-sans text-gray-100 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-800/50 p-4 px-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
          <div className="flex items-center">
            <Link
              href={`/f/${props.rootFolderId}`}
              className="mr-2 flex cursor-pointer items-center gap-2 font-semibold text-gray-100"
            >
              <Image src="/logo.png" alt="Logo" width={25} height={25} />
              t-drive
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
        <div className="overflow-hidden rounded-xl bg-gray-800/50 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
          <div className="border-t-0 border-r-0 border-b border-l-0 border-gray-700/50 bg-gray-800/30 px-6 py-4">
            <div className="grid grid-cols-12 items-center gap-4 text-xs font-medium text-gray-400 md:text-sm">
              <div className="col-span-7 md:col-span-9">Name</div>
              <div className="col-span-3 md:col-span-2">Size</div>
              <div className="col-span-2 flex justify-end md:col-span-1">
                Actions
              </div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
            <FolderDialog
              key={"new-folder"}
              trigger={
                <li className="flex cursor-pointer items-center justify-center gap-4 px-6 py-4 text-gray-400 transition-colors hover:bg-gray-700/50">
                  <Plus size={20} />
                  New folder
                </li>
              }
              title="New folder"
              description="Enter a name for your new folder."
              submitLabel="Create"
              onSubmit={async (name) => {
                await createFolder(name, props.currentFolderId);
              }}
            />
          </ul>
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-4">
          <UploadButton
            endpoint="driveUploader"
            className="mt-2"
            onClientUploadComplete={() => {
              navigate.refresh();
            }}
            input={{
              folderId: props.currentFolderId,
            }}
          />
        </div>
      </div>
    </div>
  );
}
