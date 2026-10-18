import type { MetadataRoute } from "next";

import { SEO } from "@/data/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO.siteName,
    short_name: "Butler Barber",
    description: SEO.description,
    start_url: "/",
    display: "standalone",
    background_color: SEO.themeColor,
    theme_color: SEO.themeColor,
    lang: "en",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/assets/logo/butler_logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
