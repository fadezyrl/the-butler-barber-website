import { en } from "@/data/dictionary/en";
import { SEO, SITE_URL } from "@/data/seo";
import { SITE_CONFIG, type SiteConfig } from "@/data/site-config";

const dayNames = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

const dayKeyToSchema: Record<string, (typeof dayNames)[number]> = {
  sat: "Saturday",
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

type JsonLdOptions = {
  siteConfig?: SiteConfig;
  siteUrl?: string;
  siteName?: string;
  description?: string;
  logoUrl?: string;
  ogImageUrl?: string;
  serviceLabels?: Record<string, string>;
};

export const buildHairSalonJsonLd = (
  options: JsonLdOptions = {},
): Record<string, unknown> => {
  const config = options.siteConfig ?? SITE_CONFIG;
  const siteUrl = options.siteUrl ?? SITE_URL;
  const siteName = options.siteName ?? SEO.siteName;
  const description = options.description ?? SEO.description;
  const logoUrl = options.logoUrl ?? SEO.logoUrl;
  const ogImageUrl = options.ogImageUrl ?? SEO.ogImage.url;
  const labels = options.serviceLabels ?? en.services.items;

  const street = `${config.address.street}, ${config.address.shop}`;

  const offers = config.serviceMenu.flatMap((category) =>
    category.items.map((item) => {
      const label = labels[item.id] ?? item.id;
      const priceMatch = item.price.match(/[\d.]+/);
      return {
        "@type": "Offer",
        name: label,
        price: priceMatch?.[0] ?? undefined,
        priceCurrency: "BHD",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/#services`,
      };
    }),
  );

  const phoneMatch = config.phoneTel.replace(/^tel:/, "");

  const openingHoursSpecification = config.openingHours?.length
    ? config.openingHours
        .filter((h) => !h.isClosed)
        .map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: dayKeyToSchema[h.day] ?? h.dayKey,
          opens: h.opens,
          closes: h.closes,
        }))
    : dayNames.map((day) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens: config.hours.opens,
        closes: config.hours.closes,
      }));

  return {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "LocalBusiness"],
    "@id": `${siteUrl}/#salon`,
    name: siteName,
    description,
    url: siteUrl,
    telephone: phoneMatch,
    image: [
      logoUrl,
      ogImageUrl,
      ...config.images.gallery
        .filter((item) => item.kind === "image")
        .map((item) =>
          item.src.startsWith("http") ? item.src : `${siteUrl}${item.src}`,
        ),
    ],
    logo: logoUrl,
    priceRange: "BD 1–20",
    currenciesAccepted: "BHD",
    paymentAccepted: "Cash, Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: config.address.locality,
      postalCode: config.address.postalCode,
      addressCountry: config.address.countryCode,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Manama",
      },
      {
        "@type": "AdministrativeArea",
        name: "Gudaibiya",
      },
    ],
    openingHoursSpecification,
    sameAs: [config.instagramUrl, config.googleReviewsUrl].filter(Boolean),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Barber services",
      itemListElement: offers,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phoneMatch,
      contactType: "customer service",
      areaServed: "BH",
      availableLanguage: ["English", "Arabic"],
    },
  };
};

export const buildWebSiteJsonLd = (
  options: JsonLdOptions = {},
): Record<string, unknown> => {
  const siteUrl = options.siteUrl ?? SITE_URL;
  const siteName = options.siteName ?? SEO.siteName;
  const description = options.description ?? SEO.description;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    description,
    inLanguage: ["en", "ar"],
    publisher: {
      "@id": `${siteUrl}/#salon`,
    },
  };
};
