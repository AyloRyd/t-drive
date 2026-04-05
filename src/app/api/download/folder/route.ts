import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { queries } from "~/server/db/queries";
import archiver from "archiver";
import { Readable } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const session = await auth();
  if (!session.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const folderId = searchParams.get("folderId");
  if (!folderId) {
    return new NextResponse("Missing folderId", { status: 400 });
  }

  const tree = await queries.getFolderTree(folderId, session.userId);
  if (!tree?.folder) {
    return new NextResponse("Folder not found", { status: 404 });
  }

  try {
    const archive = archiver("zip", { zlib: { level: 5 } });

    const folderMap = new Map<string, typeof tree.folder>();
    folderMap.set(tree.folder.id, tree.folder);
    for (const f of tree.folders) {
      folderMap.set(f.id, f);
    }

    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk) => controller.enqueue(chunk));
        archive.on("end", () => controller.close());
        archive.on("error", (err) => controller.error(err));
      },
    });

    void (async () => {
      try {
        for (const file of tree.files) {
          const pathParts = [];
          let currentParentId: string | null = file.parent;
          while (currentParentId && currentParentId !== folderId) {
            const parent = folderMap.get(currentParentId);
            if (!parent) break;
            pathParts.unshift(parent.name);
            currentParentId = parent.parent;
          }

          const relativePath = [...pathParts, file.name].join("/");

          const res = await fetch(file.url);
          if (!res.ok || !res.body) continue;

          // The as unknown cast is needed due to node stream types issue
          const nodeStream = Readable.fromWeb(
            res.body as unknown as NodeReadableStream,
          );
          archive.append(nodeStream, { name: relativePath });
        }
        await archive.finalize();
      } catch (err) {
        archive.emit("error", err);
      }
    })();

    const responseHeaders = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(tree.folder.name)}.zip`,
    });

    return new NextResponse(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading folder", { status: 500 });
  }
}
