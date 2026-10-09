import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";

export const metadata = {
  title: "Sign in",
  // Signed-in surface: never index, and don't follow into it.
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  const session = await auth();
  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden p-6 md:p-8"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05), transparent 60%),
          linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 56px 56px, 56px 56px",
      }}
    >
      {/* Brand Header */}
      <div className="absolute top-6 right-0 left-0 flex justify-center md:top-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="t-drive logo"
            width={22}
            height={22}
            className="opacity-90"
          />
          <span className="text-base font-bold tracking-tight text-white">
            t-drive
          </span>
        </Link>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-[380px] rounded-2xl border border-gray-800/80 bg-gray-950/45 p-8 text-center shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-gray-800 bg-linear-to-b from-gray-800/50 to-gray-900/50 shadow-inner">
          <LogIn className="h-6 w-6 text-emerald-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-gray-400">
          Sign in to your account to continue to t-drive.
        </p>

        <SignInButton forceRedirectUrl="/drive">
          <button className="w-full cursor-pointer rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-gray-950 shadow-md shadow-emerald-500/5 transition-all hover:scale-[1.01] hover:bg-gray-100 active:scale-[0.98]">
            Sign in
          </button>
        </SignInButton>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} t-drive. All rights reserved.
      </footer>
    </div>
  );
}
