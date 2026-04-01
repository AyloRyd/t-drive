"use client";

import DriveContentsList from "./drive-list";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import type { DBFileType, DBFolderType } from "~/server/db/schema";
import { useViewPreference } from "~/hooks/use-view-preference";
import DriveContentsGrid from "./drive-grid";
import DriveHeader from "./drive-header";
import { DriveActionBar } from "./drive-action-bar";
import { useEffect } from "react";
import { useSelectedItems } from "~/hooks/use-selected-items";
import { DriveDropzone } from "./drive-dropzone";

export default function DriveContents(props: {
  files: DBFileType[];
  folders: DBFolderType[];
  parents: DBFolderType[];
  currentFolderId: string;
  rootFolderId: string;
}) {
  const [view, setView] = useViewPreference();
  const clearSelection = useSelectedItems((state) => state.clearSelection);

  useEffect(() => {
    clearSelection();
  }, [clearSelection, props.currentFolderId]);

  return (
    <DriveDropzone currentFolderId={props.currentFolderId}>
      <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 font-sans text-gray-100 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "list" | "grid")}
            className="mb-36 w-full"
          >
            <div className="mb-2 flex flex-col gap-4">
              <DriveHeader
                parents={props.parents}
                rootFolderId={props.rootFolderId}
              />
              <DriveActionBar
                currentFolderId={props.currentFolderId}
                folders={props.folders}
                files={props.files}
              />
            </div>
            <TabsContent value="list" className="mt-0">
              <DriveContentsList
                files={props.files}
                folders={props.folders}
                currentFolderId={props.currentFolderId}
              />
            </TabsContent>
            <TabsContent value="grid" className="mt-0">
              <DriveContentsGrid
                files={props.files}
                folders={props.folders}
                currentFolderId={props.currentFolderId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DriveDropzone>
  );
}
