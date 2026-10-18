"use client";

import { useEffect, useState, type JSX } from "react";

import { BrandMark } from "@/components/ui/BrandMark";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

export const Footer = (): JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const [year, setYear] = useState<number | null>(null);
  const { address, phoneTel, phoneDisplay, instagramUrl, developerUrl } =
    siteConfig;

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer">
      <div className="foot-top">
        <div>
          <BrandMark className="foot-brand" style={{ color: "var(--white)" }} />
          <p className="foot-statement">{dictionary.footer.statement}</p>
        </div>
        <div className="foot-info">
          <nav aria-label={dictionary.a11y.footerNav}>
            <strong>{dictionary.footer.explore}</strong>
            <a href="#story">{dictionary.nav.story}</a>
            <a href="#services">{dictionary.nav.services}</a>
            <a href="#work">{dictionary.nav.work}</a>
            <a href="#contact">{dictionary.nav.contact}</a>
          </nav>
          <div>
            <strong>{dictionary.footer.visit}</strong>
            <p>
              {address.street}, {address.shop}, {address.locality}{" "}
              {address.postalCode}, {address.country}
            </p>
          </div>
          <div>
            <strong>{dictionary.footer.reach}</strong>
            <p>
              <a href={phoneTel}>{phoneDisplay}</a>
            </p>
            <p>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                {dictionary.gallery.instagram}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <span>
          © {year ?? ""} {dictionary.footer.rightsBrand}{" "}
          {dictionary.footer.developedBy}{" "}
          <a
            className="foot-credit"
            href={developerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {dictionary.footer.developerName}
          </a>
          . {dictionary.footer.rightsTrail}
        </span>
        <span>{dictionary.footer.openEveryDay}</span>
      </div>
    </footer>
  );
};
