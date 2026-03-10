"use client";

import { Button } from "~/components/ui/button";
import { Show, SignInButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { DB_FolderType } from "~/server/db/schema";

export default function Auth({ rootFolder }: { rootFolder: DB_FolderType }) {
  const user = useUser();

  if (!user.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Show when="signed-out">
          <SignInButton>
            <Button className="cursor-pointer rounded-md">Sign In</Button>
          </SignInButton>
        </Show>
      </div>
    );
  }

  redirect(`/f/${rootFolder.id}`);
}
