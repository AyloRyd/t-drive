import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { queries } from "~/server/db/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const session = await auth();
  if (!session.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const fileId = searchParams.get("fileId");
  if (!fileId) {
    return new NextResponse("Missing fileId", { status: 400 });
  }

  const file = await queries.getFileById(fileId, session.userId);
  if (!file) {
    return new NextResponse("File not found", { status: 404 });
  }

  try {
    const res = await fetch(file.url);
    if (!res.ok) {
      throw new Error(`Failed to fetch from Uploadthing: ${res.statusText}`);
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type":
          res.headers.get("Content-Type") ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
