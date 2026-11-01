import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { purgeAllExpired } from "~/server/services/trash";

/**
 * Daily purge of trash past its retention window, triggered by Vercel Cron
 * (see vercel.json). Vercel sends `Authorization: Bearer <CRON_SECRET>`;
 * without a configured secret the route refuses everything rather than
 * running for anyone who finds it.
 */
export async function GET(req: NextRequest) {
  const secret = env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await purgeAllExpired();
  return NextResponse.json(result);
}
