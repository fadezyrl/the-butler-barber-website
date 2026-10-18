"use client";

import { BookLink } from "@/components/ui/BookLink";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

export const Services = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();

  return (
    <section className="services" id="services">
      <div className="services-head">
        <div className="services-head-inner">
          <h2>
            {dictionary.services.titleLead}
            <span>{dictionary.services.titleEm}</span>
          </h2>
          <p className="services-note">{dictionary.services.note}</p>
        </div>
      </div>

      <div className="services-menu">
        {siteConfig.serviceMenu.map((category) => (
          <section
            className="menu-group"
            key={category.id}
            aria-labelledby={`menu-${category.id}`}
          >
            <h3 className="menu-group-title" id={`menu-${category.id}`}>
              {dictionary.services.categories[category.id] ?? category.id}
            </h3>
            <ul className="menu-list">
              {category.items.map((item) => (
                <li className="menu-item" key={item.id}>
                  <span className="menu-item-name">
                    {dictionary.services.items[item.id] ?? item.id}
                  </span>
                  <span className="menu-item-rule" aria-hidden="true" />
                  <span className="price">{item.price}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="menu-foot">
          <p>{dictionary.services.openNote}</p>
          <BookLink className="btn-dark" />
        </div>
      </div>
    </section>
  );
};
