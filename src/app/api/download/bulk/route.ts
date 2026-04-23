import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import type { SelectedDriveItem } from "~/lib/types";
import { buildZipPayloadForSelectedItems } from "~/server/services/download-zip";

function isSelectedDriveItem(item: unknown): item is SelectedDriveItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as { id?: unknown; type?: unknown };
  return (
    typeof candidate.id === "string" &&
    (candidate.type === "file" || candidate.type === "folder")
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = (await req.json()) as { items?: unknown };
    const rawItems = body.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return new NextResponse("Missing selected items", { status: 400 });
    }

    if (!rawItems.every(isSelectedDriveItem)) {
      return new NextResponse("Invalid selected items payload", {
        status: 400,
      });
    }

    const { stream, filename } = await buildZipPayloadForSelectedItems({
      items: rawItems,
      userId: session.userId,
    });

    const responseHeaders = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });

    return new NextResponse(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("Bulk download error:", error);
    return new NextResponse("Error downloading selected items", {
      status: 500,
    });
  }
}
