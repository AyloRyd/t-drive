"use client";

import { ChevronRight } from "lucide-react";
import type { DBFolderType } from "~/server/db/schema";
import Link from "next/link";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading, Show, UserButton } from "@clerk/nextjs";

export default function DriveHeader(props: {
  parents: DBFolderType[];
  rootFolderId: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-800/50 p-4 px-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
      <div className="scrollbar-none mr-8 flex min-w-0 items-center overflow-x-auto">
        <Link
          href={`/f/${props.rootFolderId}`}
          className="mr-2 flex shrink-0 cursor-pointer items-center gap-2 font-semibold text-gray-100"
        >
          <Image src="/logo.png" alt="Logo" width={25} height={25} />
          t-drive
        </Link>
        {props.parents.map(
          (folder) =>
            folder && (
              <div key={folder.id} className="flex shrink-0 items-center">
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
      <div className="flex shrink-0 items-center gap-4">
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
