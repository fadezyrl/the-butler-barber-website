export type MediaKind = "image" | "video";

export type MediaSlot = {
  src: string;
  alt: string;
  kind: MediaKind;
};

export type Review = {
  quote: string;
  quoteAr?: string;
  name: string;
  source: string;
};

export type OpeningHourDay = {
  day: "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";
  dayKey: "Sat" | "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  isClosed: boolean;
  opens: string;
  closes: string;
  displayOverride?: string | null;
  display: string;
};

export type ServiceCategoryId =
  | "hair"
  | "beard"
  | "colorFacial"
  | "waxTreatment";

export type ServiceItemId =
  | "classicCut"
  | "buzzCut"
  | "fadeCut"
  | "skinFade"
  | "childrenCut"
  | "headShave"
  | "hairShampoo"
  | "beardTrim"
  | "cleanShave"
  | "beardStyling"
  | "hotTowelShave"
  | "beardFadeStyle"
  | "hairBeardColor"
  | "colorCorrection"
  | "highlights"
  | "classicFacial"
  | "cleansingFacial"
  | "brighteningFacial"
  | "specialFacial"
  | "fullFaceWax"
  | "noseEarWax"
  | "hairKeratin"
  | "curlyHairPerm"
  | "hairProtein";

export type ServiceItem = {
  id: ServiceItemId | string;
  price: string;
};

export type ServiceCategory = {
  id: ServiceCategoryId | string;
  items: ServiceItem[];
};

export type SiteConfig = {
  logoSrc: string;
  bookingUrl: string;
  phoneTel: string;
  phoneDisplay: string;
  whatsappUrl: string;
  instagramUrl: string;
  developerUrl: string;
  googleReviewsUrl: string;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  address: {
    street: string;
    shop: string;
    locality: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  hours: {
    opens: string;
    closes: string;
    display: string;
  };
  images: {
    hero: MediaSlot;
    story: MediaSlot;
    cta: MediaSlot;
    gallery: MediaSlot[];
  };
  reviews: Review[];
  serviceMenu: ServiceCategory[];
  openingHours?: OpeningHourDay[];
};

/** Static fallback when the CMS API is unavailable. */
export const SITE_CONFIG: SiteConfig = {
  logoSrc: "/assets/logo/butler_logo.png",
  bookingUrl: "",
  phoneTel: "tel:+97335482131",
  phoneDisplay: "+973 3548 2131",
  whatsappUrl: "https://wa.me/97335482131",
  instagramUrl: "https://www.instagram.com/thebutlerbarber/",
  developerUrl: "https://www.fadezyrl.com/",
  googleReviewsUrl: "https://share.google/fu5eYccUNoOqsL8TA",
  mapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=Gudaibiya+Road+2153+Block+321+Manama+Bahrain",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Gudaibiya+Road+2153+Block+321+Manama+Bahrain&hl=en&z=16&output=embed",
  address: {
    street: "Road 2153, Block 321",
    shop: "Shop 3550, Gudaibiya",
    locality: "Manama",
    postalCode: "321",
    country: "Bahrain",
    countryCode: "BH",
  },
  hours: {
    opens: "09:00",
    closes: "23:30",
    display: "9:00 AM – 11:30 PM",
  },
  images: {
    hero: {
      src: "/assets/videos/hero-butler.MP4",
      alt: "Barber finishing a men's haircut at The Butler Barber",
      kind: "video",
    },
    story: {
      src: "/assets/videos/IMG_0073.mp4",
      alt: "Inside The Butler Barber shop",
      kind: "video",
    },
    cta: {
      src: "/assets/videos/about-butler.mp4",
      alt: "Inside The Butler Barber shop",
      kind: "video",
    },
    gallery: [
      {
        src: "/assets/gallery/IMG_0028.JPG.jpeg",
        alt: "Finished cut from the chair",
        kind: "image",
      },
      {
        src: "/assets/gallery/IMG_0040.mp4",
        alt: "Cut in progress at The Butler Barber",
        kind: "video",
      },
      {
        src: "/assets/gallery/IMG_0045.WEBP",
        alt: "Detail finish from the chair",
        kind: "image",
      },
      {
        src: "/assets/gallery/IMG_0044.MP4",
        alt: "Style work at The Butler Barber",
        kind: "video",
      },
      {
        src: "/assets/gallery/IMG_0046.MP4",
        alt: "Fade and finish from the chair",
        kind: "video",
      },
      {
        src: "/assets/gallery/IMG_0047.MP4",
        alt: "Chair work at The Butler Barber",
        kind: "video",
      },
    ],
  },
  reviews: [
    {
      quote:
        "Best fade I have had in Manama. Clean, precise, and they actually listen to what you want.",
      name: "Omar A.",
      source: "Google Review",
    },
    {
      quote:
        "Walked in for a trim and walked out sharper than I have looked in years. Proper craft.",
      name: "Hassan R.",
      source: "Google Review",
    },
    {
      quote:
        "Calm shop, skilled hands, and a skin fade that stays clean through the week.",
      name: "Yusuf M.",
      source: "Google Review",
    },
    {
      quote:
        "Consistent every visit. The detail in the finish is what keeps me coming back.",
      name: "Khalid S.",
      source: "Google Review",
    },
  ],
  serviceMenu: [
    {
      id: "hair",
      items: [
        { id: "classicCut", price: "2.000 BD" },
        { id: "buzzCut", price: "2.500 BD" },
        { id: "fadeCut", price: "2.500 BD" },
        { id: "skinFade", price: "2.500 BD" },
        { id: "childrenCut", price: "2.000 BD" },
        { id: "headShave", price: "1.500 BD" },
        { id: "hairShampoo", price: "1.000 BD" },
      ],
    },
    {
      id: "beard",
      items: [
        { id: "beardTrim", price: "1.500 BD" },
        { id: "cleanShave", price: "1.500 BD" },
        { id: "beardStyling", price: "2.000 BD" },
        { id: "hotTowelShave", price: "3.000 BD" },
        { id: "beardFadeStyle", price: "2.000 BD" },
      ],
    },
    {
      id: "colorFacial",
      items: [
        { id: "hairBeardColor", price: "5.000 BD" },
        { id: "colorCorrection", price: "3.000 BD" },
        { id: "highlights", price: "10.000 BD" },
        { id: "classicFacial", price: "3.000 BD" },
        { id: "cleansingFacial", price: "3.000 BD" },
        { id: "brighteningFacial", price: "3.000 BD" },
        { id: "specialFacial", price: "8.000 BD" },
      ],
    },
    {
      id: "waxTreatment",
      items: [
        { id: "fullFaceWax", price: "3.000 BD" },
        { id: "noseEarWax", price: "2.000 BD" },
        { id: "hairKeratin", price: "15.000 BD" },
        { id: "curlyHairPerm", price: "20.000 BD" },
        { id: "hairProtein", price: "15.000 BD" },
      ],
    },
  ],
};

export const FALLBACK_SITE_CONFIG = SITE_CONFIG;

export const getBookingHref = (config: SiteConfig): string =>
  config.bookingUrl || config.phoneTel;

export const isExternalBooking = (config: SiteConfig): boolean =>
  Boolean(config.bookingUrl);
