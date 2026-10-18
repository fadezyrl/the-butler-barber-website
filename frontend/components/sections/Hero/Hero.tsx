"use client";

import { useEffect, useState } from "react";

import { BookLink } from "@/components/ui/BookLink";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

export const Hero = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={ready ? "hero ready" : "hero"} id="top">
      <div className="hero-copy">
        <h1>
          {dictionary.hero.titleLead}
          <em>{dictionary.hero.titleEm}</em>
        </h1>
        <p className="hero-sub">{dictionary.hero.sub}</p>
        <div className="hero-actions">
          <BookLink className="btn-gold" />
          <a className="link-line" href="#work">
            {dictionary.hero.exploreWork}
          </a>
        </div>
      </div>
      <div className="hero-photo">
        <PhotoSlot
          image={siteConfig.images.hero}
          caption={siteConfig.images.hero.alt || dictionary.hero.photoCaption}
          eager
        />
      </div>
      <p className="hero-meta">{dictionary.hero.meta}</p>
      <div className="hero-foot">
        <span>
          <strong>{dictionary.hero.openStrong}</strong>
          {dictionary.hero.openRest}
        </span>
        <span>{dictionary.hero.addressLine}</span>
      </div>
    </section>
  );
};
