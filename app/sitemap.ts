import type { MetadataRoute } from "next";
import { isPreview, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return isPreview ? [] : [{ url: `${site.url}/` }];
}
