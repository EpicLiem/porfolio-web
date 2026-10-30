import type { MetadataRoute } from "next";
import { isPreview, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: isPreview ? undefined : "/", disallow: isPreview ? "/" : "/admin" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
