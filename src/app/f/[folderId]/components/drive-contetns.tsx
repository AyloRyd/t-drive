"use client";

import { ChevronRight, LayoutGrid, List } from "lucide-react";
import DriveContentsList from "./drive-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import Link from "next/link";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading, Show, UserButton } from "@clerk/nextjs";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { useViewPreference } from "~/hooks/use-view-preference";
import DriveContentsGrid from "./drive-grid";

export default function DriveContents(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  parents: DBFolderType[];
  currentFolderId: string;
  rootFolderId: string;
}) {
  const navigate = useRouter();
  const [view, setView] = useViewPreference();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 font-sans text-gray-100 md:p-8">
      <div className="mx-auto max-w-6xl">
        <DriveHeader
          parents={props.parents}
          rootFolderId={props.rootFolderId}
        />
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "list" | "grid")}
          className="w-full"
        >
          <div className="mb-4 flex justify-center">
            <TabsList className="bg-gray-800/50 shadow-lg ring-1 ring-gray-700/50">
              <TabsTrigger
                value="list"
                className="cursor-pointer text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                <List className="mr-2" size={16} />
                List
              </TabsTrigger>
              <TabsTrigger
                value="grid"
                className="cursor-pointer text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                <LayoutGrid className="mr-2" size={16} />
                Grid
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="list" className="mt-0">
            <div className="overflow-hidden rounded-xl bg-gray-800/50 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
              <div className="border-t-0 border-r-0 border-b border-l-0 border-gray-700/50 bg-gray-800/30 px-6 py-4">
                <div className="grid grid-cols-12 items-center gap-4 text-xs font-medium text-gray-400 md:text-sm">
                  <div className="col-span-7 md:col-span-7">Name</div>
                  <div className="max-md:hidden md:col-span-2">Created at</div>
                  <div className="col-span-3 md:col-span-2">Size</div>
                  <div className="col-span-2 flex justify-end md:col-span-1">
                    Actions
                  </div>
                </div>
              </div>
              <DriveContentsList
                files={props.files}
                folders={props.folders}
                currentFolderId={props.currentFolderId}
              />
            </div>
          </TabsContent>
          <TabsContent value="grid" className="mt-0">
            <DriveContentsGrid
              files={props.files}
              folders={props.folders}
              currentFolderId={props.currentFolderId}
            />
          </TabsContent>
        </Tabs>
        <div className="mt-8 flex w-full flex-col items-center justify-center">
          <UploadButton
            endpoint="driveUploader"
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

function DriveHeader(props: { parents: DBFolderType[]; rootFolderId: string }) {
  return (
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
  );
}
