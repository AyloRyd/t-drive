import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(sizeInBytes: number): string {
  if (sizeInBytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = sizeInBytes;
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

/**
 * True for clicks that should keep the browser's own link behaviour —
 * middle click, or ctrl/cmd/shift/alt click to open in a tab or window.
 */
export function isModifiedClick(e: React.MouseEvent): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
