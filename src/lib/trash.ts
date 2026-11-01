/** How long items stay in the trash before they're deleted for good. */
export const TRASH_RETENTION_DAYS = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Items trashed before this moment are past their retention window. */
export function trashCutoff(now = new Date()): Date {
  return new Date(now.getTime() - TRASH_RETENTION_DAYS * DAY_MS);
}

/** Whole days left before a trashed item is purged, never below zero. */
export function daysUntilPurge(deletedAt: Date | string, now = new Date()) {
  const purgeAt = new Date(deletedAt).getTime() + TRASH_RETENTION_DAYS * DAY_MS;
  return Math.max(0, Math.ceil((purgeAt - now.getTime()) / DAY_MS));
}

/** A top-level item in the trash, as listed on the trash page. */
export type TrashItem = {
  id: string;
  type: "file" | "folder";
  name: string;
  deletedAt: Date;
  /** File size, or the total size of everything inside a folder. */
  size: number;
  /** Folders only: how many files and folders are inside. */
  itemCount: number | null;
  /** Folder it was deleted from; "My Drive" for the root. */
  originName: string;
  /**
   * Whole days until it's purged. Computed on the server so the server
   * render and the client hydration can't disagree around midnight.
   */
  daysLeft: number;
};
