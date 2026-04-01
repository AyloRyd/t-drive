import {
  Folder as FolderIcon,
  FileIcon as DefaultFileIcon,
  Image as ImageIcon,
  FileText as DocumentIcon,
  Code as CodeIcon,
  Film as VideoIcon,
  Music as AudioIcon,
  Archive as ArchiveIcon,
  AppWindow as AppIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function FileIcon({
  type,
  name,
  size = 24,
  className = "",
}: FileIconProps) {
  const { icon: Icon, className: iconClass } = getIconConfig(type, name);
  return (
    <Icon
      className={`${iconClass} ${className}`}
      {...(type === "folder" ? { fill: "currentColor" } : {})}
      size={size}
    />
  );
}

interface FileIconProps {
  type: "folder" | "file";
  name: string;
  size?: number;
  className?: string;
}

interface IconConfig {
  icon: LucideIcon;
  className: string;
}

const FOLDER_CONFIG: IconConfig = {
  icon: FolderIcon,
  className: "text-yellow-500",
};

const DEFAULT_FILE_CONFIG: IconConfig = {
  icon: DefaultFileIcon,
  className: "text-gray-400",
};

function exts(list: string, config: IconConfig) {
  return list.split(",").map((ext) => [ext.trim(), config] as const);
}

const EXTENSION_MAP: Record<string, IconConfig> = Object.fromEntries([
  ...exts("png,jpg,jpeg,gif,webp,svg", {
    icon: ImageIcon,
    className: "text-blue-400",
  }),
  ...exts("pdf,doc,docx,txt,md,rtf", {
    icon: DocumentIcon,
    className: "text-slate-400",
  }),
  ...exts(
    "js,ts,jsx,tsx,html,css,json,py,rs,go,cpp,hpp,c,h,cs,java,php,rb,swift,kt,kts,dart,lua,sh,bash,zsh,fish",
    { icon: CodeIcon, className: "text-purple-400" },
  ),
  ...exts("mp4,avi,mov,webm,mkv", {
    icon: VideoIcon,
    className: "text-pink-400",
  }),
  ...exts("mp3,wav,ogg,flac", { icon: AudioIcon, className: "text-teal-400" }),
  ...exts("zip,rar,7z,tar,gz", {
    icon: ArchiveIcon,
    className: "text-orange-400",
  }),
  ...exts("exe,msi,dmg,deb,rpm,bat,cmd,appimage", {
    icon: AppIcon,
    className: "text-red-400",
  }),
]);

function getIconConfig(type: "folder" | "file", name: string): IconConfig {
  if (type === "folder") return FOLDER_CONFIG;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MAP[ext] ?? DEFAULT_FILE_CONFIG;
}
