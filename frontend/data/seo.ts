import { en } from "@/data/dictionary/en";
import { SITE_CONFIG, type SiteConfig } from "@/data/site-config";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.thebutlerbarber.com";

type BuildSeoOptions = {
  siteConfig?: SiteConfig;
  siteUrl?: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string[];
  themeColor?: string;
};

export const buildSeo = (options: BuildSeoOptions = {}) => {
  const siteUrl = options.siteUrl ?? SITE_URL;
  const config = options.siteConfig ?? SITE_CONFIG;
  const firstGallery = config.images.gallery[0]?.src ?? config.logoSrc;
  const ogImageSrc = firstGallery.startsWith("http")
    ? firstGallery
    : `${siteUrl}${firstGallery}`;
  const logoSrc = config.logoSrc.startsWith("http")
    ? config.logoSrc
    : `${siteUrl}${config.logoSrc}`;

  return {
    siteUrl,
    siteName: "The Butler Barber",
    title: options.title ?? en.meta.title,
    description: options.description ?? en.meta.description,
    ogTitle: options.ogTitle ?? en.meta.ogTitle,
    ogDescription: options.ogDescription ?? en.meta.ogDescription,
    locale: "en_BH",
    themeColor: options.themeColor ?? "#1C1C1B",
    keywords: options.keywords ?? [
      "barber Manama",
      "barbershop Gudaibiya",
      "haircut Bahrain",
      "skin fade Manama",
      "beard trim Bahrain",
      "The Butler Barber",
      "men's grooming Manama",
      "fade haircut Gudaibiya",
      "barber near me Manama",
    ],
    ogImage: {
      url: ogImageSrc,
      width: 1200,
      height: 1600,
      alt: "The Butler Barber — precision cuts in Gudaibiya, Manama",
    },
    logoUrl: logoSrc,
    twitterHandle: "",
  } as const;
};

export const SEO = buildSeo();

export const absoluteUrl = (path = "/"): string => {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}` || SITE_URL;
};
