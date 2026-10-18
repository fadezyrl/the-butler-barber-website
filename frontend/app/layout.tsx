import type { Metadata, Viewport } from "next";
import { Noto_Naskh_Arabic, Noto_Sans_Arabic, Poppins } from "next/font/google";
import Script from "next/script";

import { JsClass } from "@/components/JsClass";
import { buildSeo, SITE_URL } from "@/data/seo";
import { getPublishedSite } from "@/lib/cms";
import { buildHairSalonJsonLd, buildWebSiteJsonLd } from "@/lib/json-ld";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
});

export const generateMetadata = async (): Promise<Metadata> => {
  const site = await getPublishedSite();
  const dict = site.dictionaries.en;
  const seo = buildSeo({
    siteConfig: site.siteConfig,
    title: dict?.meta?.title,
    description: dict?.meta?.description,
    ogTitle: dict?.meta?.ogTitle,
    ogDescription: dict?.meta?.ogDescription,
    keywords: site.settings.seoKeywords,
    themeColor: site.settings.themeColor,
    siteUrl: site.settings.siteUrl || SITE_URL,
  });

  return {
    metadataBase: new URL(seo.siteUrl),
    title: {
      default: seo.title,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.description,
    applicationName: seo.siteName,
    keywords: [...seo.keywords],
    authors: [{ name: seo.siteName, url: seo.siteUrl }],
    creator: seo.siteName,
    publisher: seo.siteName,
    category: "barbershop",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: seo.siteUrl,
      siteName: seo.siteName,
      title: seo.ogTitle,
      description: seo.ogDescription,
      locale: seo.locale,
      alternateLocale: ["ar_BH"],
      images: [
        {
          url: seo.ogImage.url,
          width: seo.ogImage.width,
          height: seo.ogImage.height,
          alt: seo.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [seo.ogImage.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: "/icons/icon-32.png", type: "image/png", sizes: "32x32" },
        { url: "/icons/icon-48.png", type: "image/png", sizes: "48x48" },
        { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      ],
      apple: [
        {
          url: "/icons/apple-touch-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
      shortcut: [{ url: "/favicon.ico" }],
    },
    other: {
      "geo.region": "BH-13",
      "geo.placename": "Gudaibiya, Manama",
    },
  };
};

export const generateViewport = async (): Promise<Viewport> => {
  const site = await getPublishedSite();
  return {
    themeColor: site.settings.themeColor || "#1C1C1B",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">): Promise<React.JSX.Element> {
  const site = await getPublishedSite();
  const dict = site.dictionaries.en;
  const seo = buildSeo({
    siteConfig: site.siteConfig,
    title: dict?.meta?.title,
    description: dict?.meta?.description,
    ogTitle: dict?.meta?.ogTitle,
    ogDescription: dict?.meta?.ogDescription,
    keywords: site.settings.seoKeywords,
    themeColor: site.settings.themeColor,
    siteUrl: site.settings.siteUrl || SITE_URL,
  });

  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      buildHairSalonJsonLd({
        siteConfig: site.siteConfig,
        siteUrl: seo.siteUrl,
        siteName: seo.siteName,
        description: seo.description,
        logoUrl: seo.logoUrl,
        ogImageUrl: seo.ogImage.url,
        serviceLabels: dict?.services?.items,
      }),
      buildWebSiteJsonLd({
        siteUrl: seo.siteUrl,
        siteName: seo.siteName,
        description: seo.description,
      }),
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${notoNaskh.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script id="butler-locale-init" strategy="beforeInteractive">
          {`(function(){try{var k='butler-locale';var l=localStorage.getItem(k);if(l!=='ar'&&l!=='en')return;var d=document.documentElement;d.lang=l;d.dir=l==='ar'?'rtl':'ltr';d.dataset.locale=l;d.scrollLeft=0;if(document.body)document.body.scrollLeft=0;window.scrollTo(0,0);}catch(e){}})();`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
        <JsClass />
        {children}
      </body>
    </html>
  );
}
