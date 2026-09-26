/**
 * Single source of truth for classifying a file by its extension.
 * Consumed by the file icons and by the file viewer dialog.
 */

export type FileKind =
  | "image"
  | "pdf"
  | "markdown"
  | "text"
  | "document"
  | "sheet"
  | "presentation"
  | "code"
  | "video"
  | "audio"
  | "archive"
  | "app"
  | "unknown";

/** Which viewer, if any, can render a file inside the dialog. */
export type ViewerKind = "image" | "pdf" | "markdown" | "code" | "text";

/** Text-based files larger than this are not fetched for preview. */
export const TEXT_PREVIEW_LIMIT_BYTES = 1024 * 1024;

function exts(list: string, kind: FileKind) {
  return list.split(",").map((ext) => [ext.trim(), kind] as const);
}

const EXTENSION_KINDS: Record<string, FileKind> = Object.fromEntries([
  ...exts("png,jpg,jpeg,gif,webp,svg,avif,bmp,ico,heic,heif", "image"),
  ...exts("pdf", "pdf"),
  ...exts("md,markdown,mdx", "markdown"),
  ...exts("txt,log,env,csv,tsv", "text"),
  ...exts("doc,docx,rtf,odt", "document"),
  ...exts("xlsx,xls,ods", "sheet"),
  ...exts("ppt,pptx,odp", "presentation"),
  ...exts(
    "js,mjs,cjs,ts,mts,cts,jsx,tsx,html,htm,css,scss,sass,less,json,jsonc,yml,yaml,toml,ini,xml,svelte,vue,astro,graphql,gql,sql,py,rs,go,cpp,hpp,cc,hh,c,h,cs,java,php,rb,swift,kt,kts,dart,lua,r,pl,ex,exs,hs,scala,zig,sh,bash,zsh,fish,ps1,diff,patch,dockerfile",
    "code",
  ),
  ...exts("mp4,avi,mov,webm,mkv,m4v", "video"),
  ...exts("mp3,wav,ogg,flac,m4a,aac", "audio"),
  ...exts("zip,rar,7z,tar,gz,bz2,xz", "archive"),
  ...exts("exe,msi,dmg,deb,rpm,bat,cmd,appimage", "app"),
]);

export function getExtension(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext && ext !== name.toLowerCase() ? ext : "";
}

export function getFileKind(name: string): FileKind {
  return EXTENSION_KINDS[getExtension(name)] ?? "unknown";
}

/**
 * Browsers decode most image formats, but not the HEIF family, so those fall
 * through to the unsupported placeholder rather than rendering a broken image.
 */
const UNDISPLAYABLE_IMAGES = new Set(["heic", "heif"]);

/** The viewer able to render this file, or null when nothing can. */
export function getViewerKind(name: string): ViewerKind | null {
  const kind = getFileKind(name);
  switch (kind) {
    case "image":
      return UNDISPLAYABLE_IMAGES.has(getExtension(name)) ? null : "image";
    case "pdf":
      return "pdf";
    case "markdown":
      return "markdown";
    case "code":
      return "code";
    case "text":
      return "text";
    default:
      return null;
  }
}

/**
 * Extensions whose Shiki grammar is not simply the extension itself.
 * Anything absent here is passed through and validated against Shiki's
 * bundled languages and aliases before use.
 */
const LANGUAGE_OVERRIDES: Record<string, string> = {
  mjs: "javascript",
  cjs: "javascript",
  js: "javascript",
  mts: "typescript",
  cts: "typescript",
  ts: "typescript",
  htm: "html",
  py: "python",
  rs: "rust",
  rb: "ruby",
  kt: "kotlin",
  kts: "kotlin",
  hpp: "cpp",
  cc: "cpp",
  hh: "cpp",
  h: "c",
  pl: "perl",
  ex: "elixir",
  exs: "elixir",
  hs: "haskell",
  gql: "graphql",
  zsh: "shell",
  sh: "shell",
  env: "dotenv",
  log: "text",
  txt: "text",
  csv: "csv",
  tsv: "csv",
  md: "markdown",
  mdx: "mdx",
};

/** Best-guess Shiki language id for a filename. */
export function getLanguageId(name: string): string {
  const ext = getExtension(name);
  return LANGUAGE_OVERRIDES[ext] ?? ext ?? "text";
}
