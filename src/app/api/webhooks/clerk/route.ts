import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "~/server/db";
import { filesTable, foldersTable } from "~/server/db/schema";
import { env } from "~/env";

const utApi = new UTApi();

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    deleted?: boolean;
  };
}

export async function POST(req: Request) {
  console.log("Webhook received");

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = (await req.json()) as ClerkWebhookEvent;
  const body = JSON.stringify(payload);

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.deleted") {
    const userId = event.data.id;

    try {
      const userFiles = await db
        .select()
        .from(filesTable)
        .where(eq(filesTable.ownerId, userId));

      if (userFiles.length > 0) {
        const fileKeys = userFiles.map((f) =>
          f.url.replace("https://8wqc1o9kco.ufs.sh/f/", ""),
        );
        await utApi.deleteFiles(fileKeys);
      }

      await db.delete(filesTable).where(eq(filesTable.ownerId, userId));
      await db.delete(foldersTable).where(eq(foldersTable.ownerId, userId));

      console.log(`Cleaned up all data for deleted user: ${userId}`);
    } catch (err) {
      console.error(`Failed to clean up data for user ${userId}:`, err);
      return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
