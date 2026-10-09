import Link from "next/link";
import {
  Code2,
  Download,
  Eye,
  FolderTree,
  Github,
  Gauge,
  Lock,
  MousePointerClick,
} from "lucide-react";
import { githubUrl } from "~/lib/site";

const FEATURES = [
  {
    icon: FolderTree,
    title: "Upload whole folders",
    body: "Drop a nested folder and t-drive recreates the entire tree on the server, then uploads every file into the right place.",
  },
  {
    icon: Eye,
    title: "Preview without downloading",
    body: "Images, PDFs, markdown, source code, video and audio all open in a viewer dialog. Nothing leaves the browser tab.",
  },
  {
    icon: Code2,
    title: "Real syntax highlighting",
    body: "Source files are tokenised server-side with Shiki across dozens of languages, with line numbers and a raw view.",
  },
  {
    icon: Download,
    title: "Download folders as zip",
    body: "Select any mix of files and folders and stream them back as a single archive, built on the fly.",
  },
  {
    icon: MousePointerClick,
    title: "Drag, drop, done",
    body: "Drop files anywhere on the page to upload them to the folder you are looking at, with live progress and cancellation.",
  },
  {
    icon: Gauge,
    title: "Built to feel instant",
    body: "Server components, streamed responses and optimistic UI keep navigation quick even in folders with thousands of files.",
  },
];

const PREVIEWABLE = [
  { label: "Images", exts: "png · jpg · webp · gif · svg · avif" },
  { label: "Documents", exts: "pdf · md · txt · csv" },
  { label: "Code", exts: "ts · tsx · py · rs · go · sql · yaml" },
  { label: "Video", exts: "mp4 · webm" },
  { label: "Audio", exts: "mp3 · wav · ogg · m4a" },
  { label: "Archives", exts: "zip · tar · gz · 7z" },
];

export const FAQ = [
  {
    q: "What is t-drive?",
    a: "t-drive is an open-source cloud file manager for the web. You upload files and folders, organise them in a familiar tree, and preview most formats directly in the browser without downloading anything.",
  },
  {
    q: "Is t-drive free?",
    a: "Yes. t-drive is free to use and the entire source is published on GitHub under an open licence, so you can read it, fork it, or host your own copy.",
  },
  {
    q: "Which file types can I preview in the browser?",
    a: "Images, PDFs, markdown with a rendered and raw view, source code with syntax highlighting, and video and audio with a built-in player. Anything else offers a download or an open-in-new-tab fallback.",
  },
  {
    q: "Can I upload an entire folder at once?",
    a: "Yes. Pick a folder instead of individual files and t-drive recreates the whole nested structure, uploading every file into the matching folder.",
  },
  {
    q: "Can I self-host t-drive?",
    a: "Yes. It is a Next.js app backed by Postgres, Clerk for authentication and UploadThing for storage. Clone the repository, supply those environment variables and deploy it anywhere that runs Next.js.",
  },
];

export function Features() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you expect from a drive
        </h2>
        <p className="mt-4 text-base text-gray-400">
          Upload, organise, preview and share — without the bloat of a
          full office suite bolted on top.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="group rounded-2xl border border-gray-800/70 bg-gray-900/30 p-6 transition-colors hover:border-gray-700 hover:bg-gray-900/60"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
            <p className="text-sm leading-relaxed text-gray-400">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FileTypes() {
  return (
    <section className="border-y border-white/5 bg-gray-950/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Opens what you throw at it
          </h2>
          <p className="mt-4 text-base text-gray-400">
            Most formats render in place. The rest fall back to a clean
            download prompt instead of a broken tab.
          </p>
        </div>

        <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-gray-800/70 bg-gray-800/50 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEWABLE.map(({ label, exts }) => (
            <div key={label} className="bg-gray-950/80 px-6 py-5">
              <dt className="text-sm font-semibold text-white">{label}</dt>
              <dd className="mt-1 font-mono text-xs text-gray-500">{exts}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Frequently asked questions
      </h2>

      <div className="mt-12 divide-y divide-gray-800/70 border-y border-gray-800/70">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group py-5" name="faq">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-white marker:hidden">
              {q}
              <span className="shrink-0 text-xl leading-none text-gray-500 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function SiteFooter({ destination }: { destination: string }) {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-14 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Put your files somewhere calm
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={destination}
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100"
          >
            Get started
          </Link>
          <Link
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-gray-800 px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-700 hover:text-white"
          >
            <Github className="h-4 w-4" />
            Read the source
          </Link>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-gray-600">
          <Lock className="h-3 w-3" />
          Your files are private to your account.
        </p>
      </div>
    </footer>
  );
}
