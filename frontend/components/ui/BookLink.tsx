"use client";

import type { JSX, ReactNode } from "react";

import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { getBookingHref, isExternalBooking } from "@/data/site-config";

type BookLinkProps = {
  className?: string;
  children?: ReactNode;
};

export const BookLink = ({
  className,
  children,
}: BookLinkProps): JSX.Element => {
  const { dictionary } = useLanguage();
  const { siteConfig } = useSiteContent();
  const href = getBookingHref(siteConfig);
  const external = isExternalBooking(siteConfig);

  return (
    <a
      className={className}
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children ?? dictionary.nav.book}
    </a>
  );
};
