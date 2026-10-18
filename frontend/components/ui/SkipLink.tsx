"use client";

import { useLanguage } from "@/context/LanguageContext";

export const SkipLink = (): React.JSX.Element => {
  const { dictionary } = useLanguage();

  return (
    <a className="skip" href="#main">
      {dictionary.a11y.skipToContent}
    </a>
  );
};
