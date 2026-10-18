"use client";

import { BookLink } from "@/components/ui/BookLink";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

export const BookingCta = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const media = siteConfig.images.cta;

  return (
    <section className="cta" id="book">
      {media.src ? (
        <div className="cta-media" aria-hidden="true">
          {media.kind === "video" ? (
            <video
              src={media.src}
              poster="/assets/classic-fade.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.src} alt="" decoding="async" loading="lazy" />
          )}
        </div>
      ) : null}

      <div className="cta-content">
        <h2>{dictionary.cta.title}</h2>
        <div className="cta-side">
          <p>{dictionary.cta.body}</p>
          <BookLink className="btn-gold" />
        </div>
      </div>
    </section>
  );
};
