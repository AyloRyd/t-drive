import { auth } from "@clerk/nextjs/server";
import { queries } from "~/server/db/queries";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Code,
  Image as LucideImageIcon,
  Table,
  FileText,
  Film,
  Music,
  Archive,
  AppWindow,
  Folder,
  Presentation,
  FileIcon as DefaultFileIcon,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const rootFolder = session.userId
    ? await queries.getRootFolderForUser(session.userId)
    : null;
  const destination = session.userId
    ? rootFolder
      ? `/f/${rootFolder.id}`
      : "/drive"
    : "/sign-in";

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden p-6 md:p-8"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05), transparent 60%),
          linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 56px 56px, 56px 56px",
      }}
    >
      {/* Header / Navbar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="t-drive logo"
            width={24}
            height={24}
            className="opacity-90"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            t-drive
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {session.userId ? (
            <Link
              href={destination}
              className="group flex items-center gap-1 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Go to Workspace
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="group flex items-center gap-1 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Sign in
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Content */}
      <main className="mx-auto flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Headline */}
        <h1 className="mb-6 max-w-2xl text-4xl leading-none font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          The minimalist
          <span className="block bg-linear-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent">
            cloud storage.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-md text-base text-gray-400 sm:text-lg">
          Secure, fast, and easy file storage for the modern web. Keep your
          digital assets organized in a single, focused space.
        </p>

        {/* Call to Action */}
        <Link
          href={destination}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-8 py-4 text-sm font-semibold text-gray-950 shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all hover:scale-[1.02] hover:bg-gray-100 active:scale-[0.98]"
        >
          {session.userId ? "Enter Drive" : "Get started"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </main>

      {/* Floating File Type Icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        {/* Icon 1: Very Large Folder (Yellow) - 96px, 12deg, far top-left */}
        <div
          className="absolute top-[14%] left-[6%] flex h-[96px] w-[96px] rotate-12 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:left-[24%]"
          style={{ animationDuration: "7.5s" }}
        >
          <Folder className="h-10 w-10 fill-yellow-500/10 text-yellow-500" />
        </div>

        {/* Icon 2: Very Large Code (Purple) - 88px, -8deg, far top-right */}
        <div
          className="absolute top-[12%] left-[80%] flex h-[88px] w-[88px] -rotate-8 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:left-[74%]"
          style={{ animationDuration: "6.5s" }}
        >
          <Code className="h-9 w-9 text-purple-400" />
        </div>

        {/* Icon 3: Large Table (Green) - 80px, -12deg, far bottom-left */}
        <div
          className="absolute bottom-[20%] left-[6%] flex h-[80px] w-[80px] -rotate-12 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:bottom-[16%] md:left-[18%]"
          style={{ animationDuration: "7s" }}
        >
          <Table className="h-8 w-8 text-green-400" />
        </div>

        {/* Icon 4: Large Film (Pink) - 76px, 6deg, far bottom-right */}
        <div
          className="absolute bottom-[18%] left-[78%] flex h-[76px] w-[76px] rotate-6 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:left-[76%]"
          style={{ animationDuration: "9s" }}
        >
          <Film className="h-8 w-8 text-pink-400" />
        </div>

        {/* Icon 5: Large FileText (Slate) - 72px, 15deg, mid left */}
        <div
          className="absolute top-[38%] left-[4%] flex h-[72px] w-[72px] rotate-15 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:left-[8%]"
          style={{ animationDuration: "5s" }}
        >
          <FileText className="h-8 w-8 text-slate-400" />
        </div>

        {/* Icon 6: Medium-Large Image (Blue) - 68px, -15deg, mid right */}
        <div
          className="absolute top-[42%] left-[88%] flex h-[68px] w-[68px] -rotate-15 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:top-[43%] md:left-[87%]"
          style={{ animationDuration: "10s" }}
        >
          <LucideImageIcon className="h-7 w-7 text-blue-400" />
        </div>

        {/* === SCATTERED DETAILED ICONS (Responsive Desktop/Tablet) === */}
        {/* Icon 7: Medium-Large Archive (Orange) - 64px, 45deg */}
        <div
          className="absolute top-[32%] left-[78%] hidden h-[64px] w-[64px] rotate-45 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "11s" }}
        >
          <Archive className="h-6 w-6 text-orange-400" />
        </div>

        {/* Icon 8: Medium AppWindow (Red) - 60px, -6deg */}
        <div
          className="absolute top-[30%] left-[21%] hidden h-[60px] w-[60px] -rotate-6 animate-bounce items-center justify-center rounded-2xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "6.5s" }}
        >
          <AppWindow className="h-6 w-6 text-red-400" />
        </div>

        {/* Icon 9: Medium Presentation (Amber) - 56px, 10deg */}
        <div
          className="absolute top-[25%] left-[70%] hidden h-[56px] w-[56px] rotate-10 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "8.5s" }}
        >
          <Presentation className="h-5.5 w-5.5 text-amber-400" />
        </div>

        {/* Icon 10: Medium-Small Folder (Yellow) - 52px, -10deg */}
        <div
          className="absolute bottom-[20%] left-[26%] hidden h-[52px] w-[52px] -rotate-10 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "8s" }}
        >
          <Folder className="h-5 w-5 fill-yellow-500/10 text-yellow-500" />
        </div>

        {/* Icon 11: Medium-Small Code (Purple) - 48px, 45deg */}
        <div
          className="absolute top-[55%] left-[12%] hidden h-[48px] w-[48px] rotate-45 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "9.5s" }}
        >
          <Code className="h-5 w-5 text-emerald-400" />
        </div>

        {/* Icon 12: Small DefaultFileIcon (Gray) - 44px, 6deg */}
        <div
          className="absolute top-[24%] left-[16%] hidden h-[44px] w-[44px] rotate-6 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "10.5s" }}
        >
          <DefaultFileIcon className="h-4.5 w-4.5 text-gray-400" />
        </div>

        {/* Icon 13: Small Table (Green) - 40px, -12deg */}
        <div
          className="absolute top-[18%] left-[36%] hidden h-[40px] w-[40px] -rotate-12 animate-bounce items-center justify-center rounded-lg border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "7s" }}
        >
          <Table className="h-4 w-4 text-green-400" />
        </div>

        {/* Icon 14: Small Film (Pink) - 36px, 12deg */}
        <div
          className="absolute top-[16%] left-[62%] hidden h-[36px] w-[36px] rotate-12 animate-bounce items-center justify-center rounded-lg border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "8.5s" }}
        >
          <Film className="h-3.5 w-3.5 text-pink-400" />
        </div>

        {/* Icon 15: Tiny Code (Purple) - 32px, -45deg */}
        <div
          className="absolute top-[54%] left-[74%] hidden h-[32px] w-[32px] -rotate-45 animate-bounce items-center justify-center rounded-lg border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "6s" }}
        >
          <Code className="h-3.5 w-3.5 text-purple-400" />
        </div>

        {/* Icon 16: Small Archive (Orange) - 44px, 6deg */}
        <div
          className="absolute bottom-[22%] left-[28%] hidden h-[44px] w-[44px] rotate-6 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "8.2s" }}
        >
          <Archive className="h-4.5 w-4.5 text-orange-400" />
        </div>

        {/* Icon 17: Medium-Small FileText (Slate) - 48px, -6deg */}
        <div
          className="absolute bottom-[24%] left-[68%] hidden h-[48px] w-[48px] -rotate-6 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "5.5s" }}
        >
          <FileText className="h-5 w-5 text-slate-400" />
        </div>

        {/* Icon 18: Medium Music (Teal) - 52px, 15deg */}
        <div
          className="absolute top-[22%] left-[84%] hidden h-[52px] w-[52px] rotate-15 animate-bounce items-center justify-center rounded-xl border border-gray-800/80 bg-gray-900/40 shadow-xl ring-1 ring-white/5 backdrop-blur-md md:flex"
          style={{ animationDuration: "10.5s" }}
        >
          <Music className="h-5 w-5 text-teal-400" />
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t border-gray-900/60 py-4 text-center text-xs text-gray-500 sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} t-drive. All rights reserved.</p>
        <p className="tracking-wide">Built for speed and simplicity.</p>
      </footer>
    </div>
  );
}
