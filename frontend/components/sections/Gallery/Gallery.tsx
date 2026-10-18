"use client";

import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { Reveal } from "@/lib/reveal";

export const Gallery = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();

  return (
    <section className="gallery" id="work">
      <div className="gallery-head">
        <Reveal as="h2">{dictionary.gallery.title}</Reveal>
        <p>
          {dictionary.gallery.introLead}
          <a
            className="link-line"
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {dictionary.gallery.instagram}
          </a>
          {dictionary.gallery.introTrail}
        </p>
      </div>
      <div
        className="gallery-grid"
        role="list"
        aria-label={dictionary.a11y.galleryTrack}
      >
        {siteConfig.images.gallery.map((image, index) => (
          <div className="shot" key={`${image.src}-${index}`} role="listitem">
            <PhotoSlot
              image={image}
              caption={dictionary.gallery.captions[index] ?? image.alt}
            />
          </div>
        ))}
      </div>
      <div className="gallery-foot">
        <a
          className="gallery-ig"
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.gallery.scrollHint}
        </a>
      </div>
    </section>
  );
};
