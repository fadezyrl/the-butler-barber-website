"use client";

import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { Reveal } from "@/lib/reveal";

export const Story = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();

  return (
    <section className="story" id="story">
      <div className="on-light">
        <Reveal as="h2">
          {dictionary.story.titleLead}
          <span>{dictionary.story.titleEm}</span>
        </Reveal>
        <div className="story-photo">
          <PhotoSlot
            image={siteConfig.images.story}
            caption={
              siteConfig.images.story.alt || dictionary.story.photoCaption
            }
          />
        </div>
        <Reveal className="story-text">
          <p>{dictionary.story.p1}</p>
          <p>{dictionary.story.p2}</p>
          <p className="story-line">
            {dictionary.story.lineLead}
            <i>{dictionary.story.lineEm}</i>
          </p>
        </Reveal>
      </div>
    </section>
  );
};
