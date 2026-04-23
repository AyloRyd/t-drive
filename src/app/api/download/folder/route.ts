import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { queries } from "~/server/db/queries";
import { buildZipPayloadForSelectedItems } from "~/server/services/download-zip";

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

  const folder = await queries.getFolderById(folderId, session.userId);
  if (!folder) {
    return new NextResponse("Folder not found", { status: 404 });
  }

  try {
    const { stream, filename } = await buildZipPayloadForSelectedItems({
      items: [{ id: folderId, type: "folder" }],
      userId: session.userId,
    });

    const responseHeaders = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });

    return new NextResponse(stream, { headers: responseHeaders });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading folder", { status: 500 });
  }
}
