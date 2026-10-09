import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { BrandMark } from "~/components/brand-mark";
import { githubUrl } from "~/lib/site";
import { AuthLink } from "./auth-link";

export function SiteHeader() {
  return (
    // Sits directly on the page surface - no bar, no border, no blur.
    <header className="relative z-40">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <BrandMark />

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            // max-sm:hidden, not `hidden sm:flex` - the latter loses to plain `hidden`.
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors max-sm:hidden hover:bg-white/5 hover:text-white"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Link>

          <AuthLink
            signedInLabel="Open drive"
            signedOutLabel="Sign in"
            icon={
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            }
            className="group flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-100 active:scale-[0.98]"
          />
        </nav>
      </div>
    </header>
  );
}
