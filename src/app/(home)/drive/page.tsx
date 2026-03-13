import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { MUTATIONS, QUERIES } from "~/server/db/queries";
import { HardDrive } from "lucide-react";

export default async function DrivePage() {
  const session = await auth();

  if (!session.userId) {
    return redirect("/sign-in");
  }

  const rootFolder = await QUERIES.getRootFolderForUser(session.userId);

  if (!rootFolder) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50 shadow-inner ring-1 ring-gray-700/50">
          <HardDrive className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="mb-3 bg-linear-to-r from-gray-200 to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
          Welcome to t-drive
        </h1>
        <p className="mb-8 text-gray-400">
          Let&apos;s create your personal storage space to get started.
        </p>
        <form
          className="flex w-full justify-center"
          action={async () => {
            "use server";
            const session = await auth();

            if (!session.userId) {
              return redirect("/sign-in");
            }

            const rootFolderId = await MUTATIONS.onboardUser(session.userId);

            return redirect(`/f/${rootFolderId}`);
          }}
        >
          <Button className="cursor-pointer rounded-lg border border-gray-700 bg-gray-700 px-6 text-white transition-colors hover:bg-gray-800">
            Create new Drive
          </Button>
        </form>
        <footer className="mt-16 text-sm text-gray-500">
          © {new Date().getFullYear()} t-drive. All rights reserved.
        </footer>
      </div>
    );
  }

  return redirect(`/f/${rootFolder.id}`);
}
