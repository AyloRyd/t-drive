import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

/**
 * Public, crawlable routes that never go through Clerk.
 *
 * On a Clerk development instance, any request without the dev-browser cookie
 * is 307'd to Clerk's handshake endpoint - and that includes every search
 * engine crawler. Running these routes through Clerk meant Google could not
 * fetch the landing page, robots.txt or the sitemap at all. None of them read
 * auth state on the server, so they skip the middleware entirely.
 */
const PUBLIC_PATHS = new Set([
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
]);

const clerk = clerkMiddleware();

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (PUBLIC_PATHS.has(req.nextUrl.pathname)) return NextResponse.next();
  return clerk(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api(?!/webhooks)|trpc)(.*)",
  ],
};
