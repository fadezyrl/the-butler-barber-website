import type { Dictionary, Locale } from "@/data/dictionary";
import type { MediaSlot, Review, SiteConfig } from "@/data/site-config";

export type OpeningHourDay = {
  day: "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";
  dayKey: "Sat" | "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  isClosed: boolean;
  opens: string;
  closes: string;
  displayOverride?: string | null;
  display: string;
};

export type CmsServiceItem = {
  id: string;
  slug: string;
  price: string;
  currency: string;
  sortOrder: number;
  isVisible: boolean;
  nameEn: string;
  nameAr: string;
};

export type CmsServiceCategory = {
  id: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  nameEn: string;
  nameAr: string;
  items: CmsServiceItem[];
};

export type CmsGalleryItem = {
  id: string;
  src: string;
  kind: "image" | "video";
  altEn: string;
  altAr: string;
  sortOrder: number;
  isVisible: boolean;
  isPublished: boolean;
};

export type CmsTestimonial = {
  id: string;
  name: string;
  quoteEn: string;
  quoteAr: string;
  source: string;
  sortOrder: number;
  isVisible: boolean;
  isPublished: boolean;
};

export type CmsSiteSettings = {
  logoSrc: string;
  bookingUrl: string;
  phoneTel: string;
  phoneDisplay: string;
  email?: string;
  whatsappUrl: string;
  instagramUrl: string;
  developerUrl: string;
  googleReviewsUrl: string;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  address: SiteConfig["address"];
  currency?: string;
  siteUrl?: string;
  themeColor?: string;
  supportedLocales?: Locale[];
  seoKeywords?: string[];
  images: {
    hero: MediaSlot;
    story: MediaSlot;
    cta: MediaSlot;
    gallery?: MediaSlot[];
  };
};

export type CmsSiteConfig = SiteConfig & {
  openingHours?: OpeningHourDay[];
  reviews: Array<Review & { quoteAr?: string }>;
};

export type PublishedSite = {
  settings: CmsSiteSettings;
  hours: OpeningHourDay[];
  services: CmsServiceCategory[];
  gallery: CmsGalleryItem[];
  testimonials: CmsTestimonial[];
  dictionaries: Record<Locale, Dictionary>;
  siteConfig: CmsSiteConfig;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

export type AdminDashboard = {
  admin: AdminUser;
  counts: {
    services: number;
    gallery: number;
    testimonials: number;
  };
  recentPublishes: Array<{
    id: string;
    section: string;
    published_at?: string;
    created_at?: string;
    admin_id?: string;
  }>;
  updatedAt: string;
};

export type AdminDraftContent = {
  settings: {
    draft: CmsSiteSettings;
    published: CmsSiteSettings;
    updatedAt: string;
  };
  locales: Record<
    Locale,
    {
      draft: Dictionary;
      published: Dictionary;
      updatedAt: string;
    }
  >;
  services: {
    categories: Array<Record<string, unknown>>;
    items: Array<Record<string, unknown>>;
  };
  gallery: Array<Record<string, unknown>>;
  testimonials: Array<Record<string, unknown>>;
  hours: Array<Record<string, unknown>>;
  preview: {
    settings: CmsSiteSettings;
    hours: OpeningHourDay[];
    services: CmsServiceCategory[];
    gallery: CmsGalleryItem[];
    testimonials: CmsTestimonial[];
  };
};

export type MediaAsset = {
  id: string;
  url: string;
  path?: string;
  alt?: string;
  mime?: string;
  mime_type?: string;
  size_bytes?: number;
  public_url?: string;
  created_at?: string;
};

export type PublishSection =
  | "all"
  | "settings"
  | "locales"
  | "services"
  | "gallery"
  | "testimonials"
  | "hours";
