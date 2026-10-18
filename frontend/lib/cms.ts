import { dictionaries as fallbackDictionaries } from "@/data/dictionary";
import { SITE_CONFIG as FALLBACK_SITE_CONFIG } from "@/data/site-config";
import type { PublishedSite } from "@/types/cms";

const getCmsBaseUrl = (): string =>
  process.env.CMS_API_URL ||
  process.env.NEXT_PUBLIC_CMS_API_URL ||
  "http://localhost:4000";

const buildFallbackSite = (): PublishedSite => ({
  settings: {
    logoSrc: FALLBACK_SITE_CONFIG.logoSrc,
    bookingUrl: FALLBACK_SITE_CONFIG.bookingUrl,
    phoneTel: FALLBACK_SITE_CONFIG.phoneTel,
    phoneDisplay: FALLBACK_SITE_CONFIG.phoneDisplay,
    whatsappUrl: FALLBACK_SITE_CONFIG.whatsappUrl,
    instagramUrl: FALLBACK_SITE_CONFIG.instagramUrl,
    developerUrl: FALLBACK_SITE_CONFIG.developerUrl,
    googleReviewsUrl: FALLBACK_SITE_CONFIG.googleReviewsUrl,
    mapsSearchUrl: FALLBACK_SITE_CONFIG.mapsSearchUrl,
    mapsEmbedUrl: FALLBACK_SITE_CONFIG.mapsEmbedUrl,
    address: FALLBACK_SITE_CONFIG.address,
    images: {
      hero: FALLBACK_SITE_CONFIG.images.hero,
      story: FALLBACK_SITE_CONFIG.images.story,
      cta: FALLBACK_SITE_CONFIG.images.cta,
    },
  },
  hours: [],
  services: [],
  gallery: [],
  testimonials: [],
  dictionaries: fallbackDictionaries,
  siteConfig: FALLBACK_SITE_CONFIG,
});

export const getPublishedSite = async (): Promise<PublishedSite> => {
  const base = getCmsBaseUrl();

  try {
    const res = await fetch(`${base}/api/public/site`, {
      next: {
        tags: ["cms", "cms-home"],
        revalidate: 60,
      },
      // Avoid hanging the Vercel build when the API is cold/unseeded.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("CMS fetch failed:", res.status, await res.text());
      return buildFallbackSite();
    }

    const data = (await res.json()) as PublishedSite;

    if (!data?.siteConfig || !data?.dictionaries) {
      return buildFallbackSite();
    }

    return {
      ...data,
      dictionaries: {
        en: data.dictionaries.en ?? fallbackDictionaries.en,
        ar: data.dictionaries.ar ?? fallbackDictionaries.ar,
      },
      siteConfig: {
        ...FALLBACK_SITE_CONFIG,
        ...data.siteConfig,
        images: {
          ...FALLBACK_SITE_CONFIG.images,
          ...data.siteConfig.images,
          gallery:
            data.siteConfig.images?.gallery ??
            FALLBACK_SITE_CONFIG.images.gallery,
        },
        reviews: data.siteConfig.reviews ?? FALLBACK_SITE_CONFIG.reviews,
        serviceMenu:
          data.siteConfig.serviceMenu ?? FALLBACK_SITE_CONFIG.serviceMenu,
      },
    };
  } catch (err) {
    console.error("CMS fetch error:", err);
    return buildFallbackSite();
  }
};

export { FALLBACK_SITE_CONFIG };
