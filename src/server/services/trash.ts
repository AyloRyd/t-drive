import "server-only";

import { and, count, eq, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { env } from "~/env";
import { daysUntilPurge, trashCutoff, type TrashItem } from "~/lib/trash";
import type { SelectedDriveItem } from "~/lib/types";
import { db } from "~/server/db";
import { collectSubtree, planRestore } from "./trash-plan";
import { filesTable, foldersTable } from "~/server/db/schema";

const utApi = new UTApi();

/**
 * Trash model: only the item the user deleted gets `deleted_at`. A trashed
 * folder's contents are untouched and simply hidden behind it, so restoring
 * the folder brings the whole tree back as it was. These "roots" are what the
 * trash lists, restores and purges.
 */


function storageKey(url: string) {
  return url.replace(env.UPLOADTHING_APP_URL, "");
}

function splitItems(items: SelectedDriveItem[]) {
  return {
    fileIds: items.filter((i) => i.type === "file").map((i) => i.id),
    folderIds: items.filter((i) => i.type === "folder").map((i) => i.id),
  };
}

export async function trashItems(userId: string, items: SelectedDriveItem[]) {
  const { fileIds, folderIds } = splitItems(items);
  const now = new Date();

  const [files, folders] = await Promise.all([
    fileIds.length === 0
      ? []
      : db
          .update(filesTable)
          .set({ deleted_at: now })
          .where(
            and(
              eq(filesTable.ownerId, userId),
              inArray(filesTable.id, fileIds),
              isNull(filesTable.deleted_at),
            ),
          )
          .returning({ id: filesTable.id }),
    folderIds.length === 0
      ? []
      : db
          .update(foldersTable)
          .set({ deleted_at: now })
          .where(
            and(
              eq(foldersTable.ownerId, userId),
              inArray(foldersTable.id, folderIds),
              isNull(foldersTable.deleted_at),
              // The root folder is the drive itself and can't be trashed.
              isNotNull(foldersTable.parent),
            ),
          )
          .returning({ id: foldersTable.id }),
  ]);

  return { count: files.length + folders.length };
}

/** Brings trashed items back; see planRestore for where each one lands. */
export async function restoreItems(userId: string, items: SelectedDriveItem[]) {
  const { fileIds, folderIds } = splitItems(items);

  const [folders, files] = await Promise.all([
    db.select().from(foldersTable).where(eq(foldersTable.ownerId, userId)),
    fileIds.length === 0
      ? []
      : db
          .select()
          .from(filesTable)
          .where(
            and(
              eq(filesTable.ownerId, userId),
              inArray(filesTable.id, fileIds),
              isNotNull(filesTable.deleted_at),
            ),
          ),
  ]);

  const plan = planRestore({ folders, files, folderIds });
  if (!plan) return { restored: 0, movedToRoot: 0 };
  const { rootId, backInPlace, toRoot } = plan;

  const updates = [];
  for (const [group, parent] of [
    [backInPlace, undefined],
    [toRoot, rootId],
  ] as const) {
    if (group.files.length > 0) {
      updates.push(
        db
          .update(filesTable)
          .set({ deleted_at: null, ...(parent && { parent }) })
          .where(
            and(
              eq(filesTable.ownerId, userId),
              inArray(filesTable.id, group.files),
            ),
          ),
      );
    }
    if (group.folders.length > 0) {
      updates.push(
        db
          .update(foldersTable)
          .set({ deleted_at: null, ...(parent && { parent }) })
          .where(
            and(
              eq(foldersTable.ownerId, userId),
              inArray(foldersTable.id, group.folders),
            ),
          ),
      );
    }
  }
  await Promise.all(updates);

  return {
    restored:
      backInPlace.files.length +
      backInPlace.folders.length +
      toRoot.files.length +
      toRoot.folders.length,
    movedToRoot: toRoot.files.length + toRoot.folders.length,
  };
}

/**
 * Permanently deletes trash roots and everything beneath them: storage
 * objects first, then rows. If storage deletion fails the rows survive, so
 * the next purge retries instead of leaving orphaned files behind.
 */
async function purgeRoots(
  userId: string,
  roots: { fileIds: string[]; folderIds: string[] },
) {
  const folders = await db
    .select({ id: foldersTable.id, parent: foldersTable.parent })
    .from(foldersTable)
    .where(eq(foldersTable.ownerId, userId));

  const owned = new Set(folders.map((f) => f.id));
  const folderIds = [
    ...collectSubtree(
      roots.folderIds.filter((id) => owned.has(id)),
      folders,
    ),
  ];

  const matches = [];
  if (folderIds.length > 0) matches.push(inArray(filesTable.parent, folderIds));
  if (roots.fileIds.length > 0)
    matches.push(inArray(filesTable.id, roots.fileIds));

  const files =
    matches.length === 0
      ? []
      : await db
          .select({ id: filesTable.id, url: filesTable.url })
          .from(filesTable)
          .where(and(eq(filesTable.ownerId, userId), or(...matches)));

  if (files.length > 0) {
    const result = await utApi.deleteFiles(files.map((f) => storageKey(f.url)));
    if (!result.success) {
      throw new Error(`Storage refused to delete ${files.length} file(s)`);
    }
    await db.delete(filesTable).where(
      and(
        eq(filesTable.ownerId, userId),
        inArray(
          filesTable.id,
          files.map((f) => f.id),
        ),
      ),
    );
  }

  if (folderIds.length > 0) {
    await db
      .delete(foldersTable)
      .where(
        and(
          eq(foldersTable.ownerId, userId),
          inArray(foldersTable.id, folderIds),
        ),
      );
  }

  return { files: files.length, folders: folderIds.length };
}

/** Deletes the given items forever - only ones that are actually in trash. */
export async function deleteForever(userId: string, items: SelectedDriveItem[]) {
  const { fileIds, folderIds } = splitItems(items);

  const [files, folders] = await Promise.all([
    fileIds.length === 0
      ? []
      : db
          .select({ id: filesTable.id })
          .from(filesTable)
          .where(
            and(
              eq(filesTable.ownerId, userId),
              inArray(filesTable.id, fileIds),
              isNotNull(filesTable.deleted_at),
            ),
          ),
    folderIds.length === 0
      ? []
      : db
          .select({ id: foldersTable.id })
          .from(foldersTable)
          .where(
            and(
              eq(foldersTable.ownerId, userId),
              inArray(foldersTable.id, folderIds),
              isNotNull(foldersTable.deleted_at),
            ),
          ),
  ]);

  await purgeRoots(userId, {
    fileIds: files.map((f) => f.id),
    folderIds: folders.map((f) => f.id),
  });

  return { count: files.length + folders.length };
}

async function trashRoots(userId: string, olderThan?: Date) {
  const fileFilter = and(
    eq(filesTable.ownerId, userId),
    isNotNull(filesTable.deleted_at),
    olderThan && lt(filesTable.deleted_at, olderThan),
  );
  const folderFilter = and(
    eq(foldersTable.ownerId, userId),
    isNotNull(foldersTable.deleted_at),
    olderThan && lt(foldersTable.deleted_at, olderThan),
  );

  const [files, folders] = await Promise.all([
    db.select({ id: filesTable.id }).from(filesTable).where(fileFilter),
    db.select({ id: foldersTable.id }).from(foldersTable).where(folderFilter),
  ]);

  return {
    fileIds: files.map((f) => f.id),
    folderIds: folders.map((f) => f.id),
  };
}

export async function emptyTrash(userId: string) {
  const roots = await trashRoots(userId);
  await purgeRoots(userId, roots);
  return { count: roots.fileIds.length + roots.folderIds.length };
}

/** Purges this user's items whose retention window has run out. */
export async function purgeExpiredForUser(userId: string) {
  const roots = await trashRoots(userId, trashCutoff());
  if (roots.fileIds.length === 0 && roots.folderIds.length === 0) {
    return { files: 0, folders: 0 };
  }
  return purgeRoots(userId, roots);
}

/** Scheduled purge across every user. One failing user doesn't stop the rest. */
export async function purgeAllExpired() {
  const cutoff = trashCutoff();
  const [fileOwners, folderOwners] = await Promise.all([
    db
      .selectDistinct({ ownerId: filesTable.ownerId })
      .from(filesTable)
      .where(lt(filesTable.deleted_at, cutoff)),
    db
      .selectDistinct({ ownerId: foldersTable.ownerId })
      .from(foldersTable)
      .where(lt(foldersTable.deleted_at, cutoff)),
  ]);

  const owners = new Set([...fileOwners, ...folderOwners].map((r) => r.ownerId));
  const totals = { users: owners.size, files: 0, folders: 0, failedUsers: 0 };

  for (const ownerId of owners) {
    try {
      const purged = await purgeExpiredForUser(ownerId);
      totals.files += purged.files;
      totals.folders += purged.folders;
    } catch (error) {
      totals.failedUsers++;
      console.error(`Trash purge failed for user ${ownerId}:`, error);
    }
  }

  return totals;
}

/** Number of items in the trash, for the header badge. */
export async function countTrash(userId: string) {
  const [[files], [folders]] = await Promise.all([
    db
      .select({ n: count() })
      .from(filesTable)
      .where(
        and(eq(filesTable.ownerId, userId), isNotNull(filesTable.deleted_at)),
      ),
    db
      .select({ n: count() })
      .from(foldersTable)
      .where(
        and(
          eq(foldersTable.ownerId, userId),
          isNotNull(foldersTable.deleted_at),
        ),
      ),
  ]);
  return (files?.n ?? 0) + (folders?.n ?? 0);
}

export async function getTrashForUser(userId: string): Promise<TrashItem[]> {
  const [folders, trashedFiles] = await Promise.all([
    db.select().from(foldersTable).where(eq(foldersTable.ownerId, userId)),
    db
      .select()
      .from(filesTable)
      .where(
        and(eq(filesTable.ownerId, userId), isNotNull(filesTable.deleted_at)),
      ),
  ]);

  const byId = new Map(folders.map((f) => [f.id, f]));
  const originName = (parentId: string | null) => {
    const parent = parentId ? byId.get(parentId) : undefined;
    if (!parent) return "My Drive";
    return parent.parent === null ? "My Drive" : parent.name;
  };

  const trashedFolders = folders.filter((f) => f.deleted_at);

  // Sizes and item counts for trashed folders, from one query for all of them.
  const subtrees = new Map(
    trashedFolders.map((f) => [f.id, collectSubtree([f.id], folders)]),
  );
  const allInside = [...new Set([...subtrees.values()].flatMap((s) => [...s]))];
  const filesInside =
    allInside.length === 0
      ? []
      : await db
          .select({ parent: filesTable.parent, size: filesTable.size })
          .from(filesTable)
          .where(
            and(
              eq(filesTable.ownerId, userId),
              inArray(filesTable.parent, allInside),
            ),
          );

  const items: TrashItem[] = [
    ...trashedFolders.map((folder) => {
      const subtree = subtrees.get(folder.id)!;
      const files = filesInside.filter((f) => subtree.has(f.parent));
      return {
        id: folder.id,
        type: "folder" as const,
        name: folder.name,
        deletedAt: folder.deleted_at!,
        size: files.reduce((sum, f) => sum + f.size, 0),
        itemCount: subtree.size - 1 + files.length,
        originName: originName(folder.parent),
        daysLeft: daysUntilPurge(folder.deleted_at!),
      };
    }),
    ...trashedFiles.map((file) => ({
      id: file.id,
      type: "file" as const,
      name: file.name,
      deletedAt: file.deleted_at!,
      size: file.size,
      itemCount: null,
      originName: originName(file.parent),
      daysLeft: daysUntilPurge(file.deleted_at!),
    })),
  ];

  return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
}
