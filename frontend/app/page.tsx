import type { Metadata } from "next";

import "@/app/styles/site.css";
import { BookingCta } from "@/components/sections/BookingCta/BookingCta";
import { Contact } from "@/components/sections/Contact/Contact";
import { Footer } from "@/components/sections/Footer/Footer";
import { Gallery } from "@/components/sections/Gallery/Gallery";
import { Header } from "@/components/sections/Header/Header";
import { Hero } from "@/components/sections/Hero/Hero";
import { Map } from "@/components/sections/Map/Map";
import { Reviews } from "@/components/sections/Reviews/Reviews";
import { Services } from "@/components/sections/Services/Services";
import { Story } from "@/components/sections/Story/Story";
import { Team } from "@/components/sections/Team/Team";
import { SkipLink } from "@/components/ui/SkipLink";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { LanguageProvider } from "@/context/LanguageContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { buildSeo } from "@/data/seo";
import { getPublishedSite } from "@/lib/cms";

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
    siteUrl: site.settings.siteUrl,
  });

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.siteUrl,
    },
  };
};

export default async function Home(): Promise<React.JSX.Element> {
  const site = await getPublishedSite();

  return (
    <SiteContentProvider
      siteConfig={site.siteConfig}
      dictionaries={site.dictionaries}
    >
      <LanguageProvider dictionaries={site.dictionaries}>
        <SkipLink />
        <Header />
        <main id="main">
          <Hero />
          <Story />
          <Services />
          <Team />
          <Gallery />
          <Reviews />
          <Contact />
          <BookingCta />
          <Map />
        </main>
        <Footer />
        <WhatsAppFloat />
      </LanguageProvider>
    </SiteContentProvider>
  );
}
