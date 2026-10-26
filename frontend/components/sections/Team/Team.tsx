"use client";

import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { Reveal } from "@/lib/reveal";

export const Team = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const members = siteConfig.team ?? [];

  return (
    <section className="team" id="team">
      <div className="team-head">
        <Reveal as="h2">
          {dictionary.team.titleLead}
          <span>{dictionary.team.titleEm}</span>
        </Reveal>
        <Reveal as="p" className="team-intro">
          {dictionary.team.intro}
        </Reveal>
      </div>

      <div className="team-grid">
        {members.map((member) => {
          const copy = dictionary.team.members[member.id];
          if (!copy) return null;

          return (
            <Reveal as="div" className="team-card-wrap" key={member.id}>
              <article className="team-card">
                <div className="team-photo">
                  <PhotoSlot
                    image={member.image}
                    caption={member.image.alt || copy.name}
                  />
                </div>
                <h3 className="team-name">{copy.name}</h3>
                <p className="team-role">{copy.role}</p>
                <p className="team-bio">{copy.bio}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
