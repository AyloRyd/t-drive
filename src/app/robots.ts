import type { MetadataRoute } from "next";
import { siteUrl } from "~/lib/site";

/**
 * Only the landing page is public. Everything else is either a signed-in
 * view of someone's files or an API route, and none of it should end up in
 * a search index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/f/", "/drive", "/sign-in", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
