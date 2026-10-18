"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useSiteContentOptional } from "@/context/SiteContentContext";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  localeDirection,
  type Dictionary,
  type Locale,
} from "@/data/dictionary";

export const LOCALE_STORAGE_KEY = "butler-locale";

type LanguageContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
  dictionaries?: Record<Locale, Dictionary>;
};

const resetHorizontalScroll = (): void => {
  window.scrollTo(0, window.scrollY);
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
};

const applyDocumentLocale = (locale: Locale): void => {
  const root = document.documentElement;
  root.lang = locale;
  root.dir = localeDirection(locale);
  root.dataset.locale = locale;
  resetHorizontalScroll();
};

const readStoredLocale = (): Locale | null => {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

const persistLocale = (locale: Locale): void => {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore persistence failures.
  }
};

export const LanguageProvider = ({
  children,
  dictionaries: dictionariesProp,
}: LanguageProviderProps): React.JSX.Element => {
  const siteContent = useSiteContentOptional();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromDom = document.documentElement.lang;
    const initial =
      (isLocale(fromDom) ? fromDom : null) ??
      readStoredLocale() ??
      DEFAULT_LOCALE;

    applyDocumentLocale(initial);
    persistLocale(initial);
    setLocaleState(initial);
    setHydrated(true);
  }, []);

  const setLocale = (next: Locale): void => {
    applyDocumentLocale(next);
    persistLocale(next);
    setLocaleState(next);
  };

  useEffect(() => {
    if (!hydrated) return;
    applyDocumentLocale(locale);
  }, [hydrated, locale]);

  const dictionaries =
    dictionariesProp ?? siteContent?.dictionaries ?? null;

  const dictionary =
    dictionaries?.[locale] ??
    dictionaries?.[DEFAULT_LOCALE] ??
    getDictionary(locale);

  const value: LanguageContextValue = {
    locale,
    dictionary,
    setLocale,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
};
