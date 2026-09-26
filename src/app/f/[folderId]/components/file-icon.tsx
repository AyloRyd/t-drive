import {
  Folder as FolderIcon,
  FileIcon as DefaultFileIcon,
  Image as ImageIcon,
  FileText as DocumentIcon,
  Table as TableIcon,
  Presentation as PresentationIcon,
  Code as CodeIcon,
  Film as VideoIcon,
  Music as AudioIcon,
  Archive as ArchiveIcon,
  AppWindow as AppIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getFileKind, type FileKind } from "~/lib/file-kind";

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

const KIND_CONFIG: Record<FileKind, IconConfig> = {
  image: { icon: ImageIcon, className: "text-blue-400" },
  pdf: { icon: DocumentIcon, className: "text-slate-400" },
  markdown: { icon: DocumentIcon, className: "text-slate-400" },
  text: { icon: DocumentIcon, className: "text-slate-400" },
  document: { icon: DocumentIcon, className: "text-slate-400" },
  sheet: { icon: TableIcon, className: "text-green-400" },
  presentation: { icon: PresentationIcon, className: "text-yellow-400" },
  code: { icon: CodeIcon, className: "text-purple-400" },
  video: { icon: VideoIcon, className: "text-pink-400" },
  audio: { icon: AudioIcon, className: "text-teal-400" },
  archive: { icon: ArchiveIcon, className: "text-orange-400" },
  app: { icon: AppIcon, className: "text-red-400" },
  unknown: DEFAULT_FILE_CONFIG,
};

function getIconConfig(type: "folder" | "file", name: string): IconConfig {
  if (type === "folder") return FOLDER_CONFIG;
  return KIND_CONFIG[getFileKind(name)];
}
