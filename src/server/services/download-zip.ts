import "server-only";

import archiver from "archiver";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import type { SelectedDriveItem } from "~/lib/types";
import type { DBFolderType } from "~/server/db/schema";
import { queries } from "~/server/db/queries";

interface ZipEntry {
  fileId: string;
  path: string;
  url: string;
}

interface BuildZipPayloadParams {
  items: SelectedDriveItem[];
  userId: string;
}

const ZIP_PREFIX = "t-drive-dowload";

function sanitizePathSegment(segment: string) {
  const cleaned = segment
    .replaceAll("\\", "_")
    .replaceAll("/", "_")
    .replace(/\.\.+/g, ".")
    .trim();
  return cleaned.length > 0 ? cleaned : "untitled";
}

function toSafePath(parts: string[]) {
  return parts.map((part) => sanitizePathSegment(part)).join("/");
}

function appendSuffixToPath(path: string, count: number) {
  const separatorIndex = path.lastIndexOf("/");
  const folder = separatorIndex >= 0 ? path.slice(0, separatorIndex + 1) : "";
  const name = separatorIndex >= 0 ? path.slice(separatorIndex + 1) : path;
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0) {
    return `${folder}${name} (${count})`;
  }
  return `${folder}${name.slice(0, dotIndex)} (${count})${name.slice(dotIndex)}`;
}

function ensureUniquePath(path: string, usedPaths: Set<string>) {
  if (!usedPaths.has(path)) {
    usedPaths.add(path);
    return path;
  }

  let count = 2;
  let nextPath = appendSuffixToPath(path, count);
  while (usedPaths.has(nextPath)) {
    count += 1;
    nextPath = appendSuffixToPath(path, count);
  }

  usedPaths.add(nextPath);
  return nextPath;
}

function buildRelativePathInFolderTree(params: {
  fileName: string;
  rootFolderId: string;
  fileParentId: string;
  folderNameById: Map<string, string>;
}) {
  const { fileName, rootFolderId, fileParentId, folderNameById } = params;
  const pathParts: string[] = [];
  let currentParentId: string | null = fileParentId;

  while (currentParentId && currentParentId !== rootFolderId) {
    const parentName = folderNameById.get(currentParentId);
    if (!parentName) break;
    pathParts.unshift(parentName);
    const nextParent = folderNameById.get(`${currentParentId}::parent`);
    currentParentId = nextParent ?? null;
  }

  pathParts.push(fileName);
  return toSafePath(pathParts);
}

function createFolderMaps(folders: DBFolderType[]) {
  const folderNameById = new Map<string, string>();
  for (const folder of folders) {
    folderNameById.set(folder.id, folder.name);
    folderNameById.set(`${folder.id}::parent`, folder.parent ?? "");
  }
  return { folderNameById };
}

async function collectZipEntries(params: BuildZipPayloadParams) {
  const { items, userId } = params;
  const byFileId = new Set<string>();
  const usedPaths = new Set<string>();
  const entries: ZipEntry[] = [];

  for (const item of items) {
    if (item.type === "file") {
      const file = await queries.getFileById(item.id, userId);
      if (!file || byFileId.has(file.id)) continue;

      byFileId.add(file.id);
      const rawPath = toSafePath([file.name]);
      const uniquePath = ensureUniquePath(rawPath, usedPaths);
      entries.push({ fileId: file.id, path: uniquePath, url: file.url });
      continue;
    }

    const tree = await queries.getFolderTree(item.id, userId);
    if (!tree?.folder) continue;

    const rootFolderName = sanitizePathSegment(tree.folder.name);
    const { folderNameById } = createFolderMaps(tree.folders);

    for (const file of tree.files) {
      if (byFileId.has(file.id)) continue;
      byFileId.add(file.id);

      const pathInsideRoot = buildRelativePathInFolderTree({
        fileName: file.name,
        rootFolderId: tree.folder.id,
        fileParentId: file.parent,
        folderNameById,
      });

      const rawPath = toSafePath([rootFolderName, pathInsideRoot]);
      const uniquePath = ensureUniquePath(rawPath, usedPaths);
      entries.push({ fileId: file.id, path: uniquePath, url: file.url });
    }
  }

  return entries;
}

export function createZipFilename(datetime = new Date()) {
  const safeDatetime = datetime.toISOString().replace(/[:.]/g, "-");
  return `${ZIP_PREFIX}-${safeDatetime}.zip`;
}

export async function buildZipPayloadForSelectedItems(
  params: BuildZipPayloadParams,
) {
  const entries = await collectZipEntries(params);
  const archive = archiver("zip", { zlib: { level: 5 } });

  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));
    },
  });

  void (async () => {
    try {
      for (const entry of entries) {
        const res = await fetch(entry.url);
        if (!res.ok || !res.body) continue;

        const nodeStream = Readable.fromWeb(
          res.body as unknown as NodeReadableStream,
        );
        archive.append(nodeStream, { name: entry.path });
      }
      await archive.finalize();
    } catch (error) {
      archive.emit("error", error);
    }
  })();

  return {
    filename: createZipFilename(),
    stream,
  };
}
