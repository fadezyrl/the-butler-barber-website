"use client";

import { useEffect, useState } from "react";

import { BookLink } from "@/components/ui/BookLink";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";

const DAY_KEYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export const Contact = (): React.JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    try {
      const short = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "Asia/Bahrain",
      }).format(new Date());
      setToday(short);
    } catch {
      setToday("");
    }
  }, []);

  const { address, phoneTel, phoneDisplay, mapsSearchUrl, hours, openingHours } =
    siteConfig;

  const displayForDay = (day: (typeof DAY_KEYS)[number]): string => {
    const entry = openingHours?.find((h) => h.dayKey === day);
    if (entry) return entry.display;
    return hours.display;
  };

  return (
    <section className="contact" id="contact">
      <div>
        <h2>{dictionary.contact.title}</h2>
        <address className="address">
          {address.street}
          <span>{address.shop}</span>
          <span>
            {address.locality} {address.postalCode}, {address.country}
          </span>
        </address>
        <a className="phone" href={phoneTel}>
          {phoneDisplay}
        </a>
        <div className="contact-actions">
          <BookLink className="btn-gold" />
          <a
            className="link-line"
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {dictionary.contact.getDirections}
          </a>
        </div>
      </div>
      <div className="hours">
        <h3>{dictionary.contact.hoursTitle}</h3>
        <dl>
          {DAY_KEYS.map((day) => (
            <div
              className={today === day ? "row today" : "row"}
              key={day}
              data-day={day}
            >
              <dt>{dictionary.contact.days[day]}</dt>
              <dd>{displayForDay(day)}</dd>
            </div>
          ))}
        </dl>
        <p className="hours-note">{dictionary.contact.hoursNote}</p>
      </div>
    </section>
  );
};
