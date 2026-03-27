"use client";

import { LayoutGrid, List } from "lucide-react";
import DriveContentsList from "./drive-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { useViewPreference } from "~/hooks/use-view-preference";
import DriveContentsGrid from "./drive-grid";
import DriveHeader from "./drive-header";

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
