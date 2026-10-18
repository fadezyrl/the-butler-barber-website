"use client";

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

export const Map = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const frameRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { address, mapsSearchUrl, mapsEmbedUrl } = siteConfig;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || loaded) return;

    const load = (): void => setLoaded(true);

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }

    const mo = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          load();
          mo.disconnect();
        }
      },
      { rootMargin: "400px" },
    );

    mo.observe(frame);
    return () => mo.disconnect();
  }, [loaded]);

  return (
    <section className="map" id="map">
      <div className="map-label">
        <div>
          <p className="map-eyebrow">{dictionary.map.eyebrow}</p>
          <h2>{dictionary.map.title}</h2>
          <address>
            {dictionary.brand.name}
            <br />
            {address.street}, {address.shop}
            <br />
            {address.locality} {address.postalCode}, {address.country}
          </address>
        </div>
        <a
          className="map-link"
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.map.openInMaps}
        </a>
      </div>
      <div className="map-frame" ref={frameRef}>
        <div className="map-fallback">
          <span>{dictionary.map.fallback}</span>
        </div>
        {loaded ? (
          <iframe
            className="map-canvas"
            title={dictionary.a11y.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapsEmbedUrl}
          />
        ) : null}
        <div className="map-veil" aria-hidden="true" />
        <div className="map-frame-line" aria-hidden="true" />
        <div className="map-pin" aria-hidden="true">
          <span className="map-pin-dot" />
          <span className="map-pin-label">{dictionary.map.pinLabel}</span>
        </div>
      </div>
    </section>
  );
};
