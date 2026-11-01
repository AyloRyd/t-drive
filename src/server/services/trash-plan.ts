/**
 * Pure tree logic behind the trash, kept free of database access so it can
 * be reasoned about - and tested - on its own.
 */

type FolderNode = {
  id: string;
  parent: string | null;
  deleted_at: Date | null;
};

/** Every folder id at or below the given roots, trashed or not. */
export function collectSubtree(
  rootIds: Iterable<string>,
  folders: Pick<FolderNode, "id" | "parent">[],
): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const folder of folders) {
    if (folder.parent === null) continue;
    const siblings = childrenOf.get(folder.parent) ?? [];
    siblings.push(folder.id);
    childrenOf.set(folder.parent, siblings);
  }

  const result = new Set<string>();
  const stack = [...rootIds];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    stack.push(...(childrenOf.get(id) ?? []));
  }
  return result;
}

type Group = { files: string[]; folders: string[] };

/**
 * Decides where each restored item goes. It returns to the folder it was
 * deleted from, unless that folder (or any ancestor) stays in the trash -
 * then it goes to the root, so it doesn't reappear somewhere invisible.
 * Folders restored in the same batch count as live destinations.
 *
 * `files` must already be filtered to trashed files the user owns.
 * Returns null if the user has no root folder.
 */
export function planRestore(params: {
  folders: FolderNode[];
  files: { id: string; parent: string }[];
  folderIds: string[];
}): { rootId: string; backInPlace: Group; toRoot: Group } | null {
  const { folders, files, folderIds } = params;

  const root = folders.find((f) => f.parent === null);
  if (!root) return null;

  const byId = new Map(folders.map((f) => [f.id, f]));
  const restoring = new Set(folderIds.filter((id) => byId.get(id)?.deleted_at));

  const isLive = (folderId: string) => {
    let current = byId.get(folderId);
    while (current) {
      if (current.deleted_at && !restoring.has(current.id)) return false;
      if (current.parent === null) return true;
      current = byId.get(current.parent);
    }
    // Ran off the tree: the destination no longer exists.
    return false;
  };

  const backInPlace: Group = { files: [], folders: [] };
  const toRoot: Group = { files: [], folders: [] };

  for (const file of files) {
    (isLive(file.parent) ? backInPlace : toRoot).files.push(file.id);
  }
  for (const id of restoring) {
    const parent = byId.get(id)!.parent!;
    (isLive(parent) ? backInPlace : toRoot).folders.push(id);
  }

  return { rootId: root.id, backInPlace, toRoot };
}
