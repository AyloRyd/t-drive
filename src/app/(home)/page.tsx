import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { GridBackground } from "~/components/grid-background";
import { githubUrl, siteDescription, siteName, siteUrl } from "~/lib/site";
import { AuthLink } from "./components/auth-link";
import { FloatingIcons } from "./components/floating-icons";
import { SiteHeader } from "./components/site-header";
import {
  FAQ,
  FaqSection,
  Features,
  FileTypes,
  SiteFooter,
} from "./components/landing-sections";

/**
 * Static, with no server-side auth: this route is deliberately kept out of the
 * Clerk middleware (see src/proxy.ts) so crawlers can fetch it. Anything that
 * depends on the visitor being signed in resolves on the client in AuthLink.
 */
export default function HomePage() {
  return (
    <GridBackground>
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden px-6 pt-20 pb-20 sm:pt-36 sm:pb-32">
        <FloatingIcons />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="text-5xl leading-[0.95] font-extrabold tracking-tight text-balance text-white sm:text-6xl md:text-7xl">
            Your files,
            <span className="block bg-linear-to-br from-white via-gray-300 to-gray-600 bg-clip-text text-transparent">
              without the clutter.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base text-pretty text-gray-400 sm:text-lg">
            Upload whole folders, preview images, PDFs, code and media right in
            the browser, and pull anything back down as a zip. Open source, and
            yours to fork.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <AuthLink
              signedInLabel="Open your drive"
              signedOutLabel="Get started free"
              icon={
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              }
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-950 shadow-[0_0_40px_rgba(16,185,129,0.18)] transition-all hover:scale-[1.02] hover:bg-gray-100 active:scale-[0.98]"
            />
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-6 py-3.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-gray-700 hover:text-white"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Product shot */}
      <section className="relative px-6 pb-20 sm:pb-24">
        <div className="relative mx-auto max-w-5xl">
          {/* Cropped rather than scaled down: the shot stays wide and legible
              while taking roughly 40% of the fold to the hero's 60%. */}
          <div className="max-h-[260px] overflow-hidden rounded-xl border border-gray-800/80 shadow-2xl shadow-black/60 ring-1 ring-white/5 sm:max-h-[340px] sm:rounded-2xl">
            <Image
              src="/drive-preview.webp"
              alt="The t-drive file browser showing folders and files with names, dates and sizes"
              width={2000}
              height={1274}
              priority
              className="w-full"
            />
          </div>
          {/* Fades the screenshot into the page rather than cutting it off. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-gray-950 to-transparent" />
        </div>
      </section>

      <Features />
      <FileTypes />
      <FaqSection />
      <SiteFooter />

      {/* Structured data: lets Google show rich results for the app and the FAQ. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              codeRepository: githubUrl,
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
          ]),
        }}
      />
    </GridBackground>
  );
}
