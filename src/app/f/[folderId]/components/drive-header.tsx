"use client";

import { ChevronRight, Trash2 } from "lucide-react";
import type { DBFolderType } from "~/server/db/schema";
import Link from "next/link";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading, Show, UserButton } from "@clerk/nextjs";

export default function DriveHeader(props: {
  parents: DBFolderType[];
  rootFolderId: string;
  /** Items currently in the trash, shown as a badge on the trash button. */
  trashCount: number;
  /** Set on the trash page: adds the crumb and marks the button active. */
  section?: "trash";
}) {
  const inTrash = props.section === "trash";

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
        {inTrash && (
          <div className="flex shrink-0 items-center">
            <ChevronRight className="mx-2 text-gray-500" size={16} />
            <span className="text-gray-100">Trash</span>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-5">
        <Link
          href="/trash"
          aria-label={
            props.trashCount > 0
              ? `Trash, ${props.trashCount} items`
              : "Trash"
          }
          title="Trash"
          aria-current={inTrash ? "page" : undefined}
          className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            inTrash
              ? "bg-gray-700/80 text-white"
              : "text-gray-400 hover:bg-gray-700/60 hover:text-white"
          }`}
        >
          <Trash2 size={18} />
          {props.trashCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-200 px-1 text-[10px] leading-none font-semibold text-gray-900 tabular-nums">
              {props.trashCount > 99 ? "99+" : props.trashCount}
            </span>
          )}
        </Link>
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
