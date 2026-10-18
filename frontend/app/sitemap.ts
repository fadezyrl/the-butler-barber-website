import type { MetadataRoute } from "next";

import { SITE_URL } from "@/data/seo";

/** Fixed build-time date — avoid `new Date()` (breaks sitemap under cacheComponents). */
const LAST_MODIFIED = "2026-10-18";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
