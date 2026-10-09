import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Check, HardDrive } from "lucide-react";
import { BrandMark } from "~/components/brand-mark";
import { GridBackground } from "~/components/grid-background";
import { queries } from "~/server/db/queries";
import { onboardUser } from "~/server/actions/onboard.actions";

export const metadata = {
  title: "Set up your drive",
  // Signed-in surface: never index, and don't follow into it.
  robots: { index: false, follow: false },
};

export default async function DrivePage() {
  const session = await auth();
  if (!session.userId) {
    return redirect("/sign-in");
  }

  const rootFolder = await queries.getRootFolderForUser(session.userId);
  if (rootFolder) {
    return redirect(`/f/${rootFolder.id}`);
  }

  return (
    <GridBackground className="flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <BrandMark />
      </div>

      <div className="w-full max-w-[420px] rounded-2xl border border-gray-800/80 bg-gray-950/50 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
          <HardDrive className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          One last step
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          We need to create your root folder before you can start uploading.
          It takes a second.
        </p>

        <ol className="my-7 space-y-3">
          <li className="flex items-center gap-3 text-sm text-gray-300">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-3 w-3" />
            </span>
            Account verified
          </li>
          <li className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-[10px] font-bold">
              2
            </span>
            Create your personal storage space
          </li>
        </ol>

        <form
          action={async () => {
            "use server";
            const inner = await auth();
            if (!inner.userId) return redirect("/sign-in");

            const result = await onboardUser();
            if (!result.success || !result.data.rootFolderId) {
              return redirect("/sign-in");
            }

            return redirect(`/f/${result.data.rootFolderId}`);
          }}
        >
          <button
            type="submit"
            className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-100 active:scale-[0.98]"
          >
            Create my drive
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      </div>
    </GridBackground>
  );
}
