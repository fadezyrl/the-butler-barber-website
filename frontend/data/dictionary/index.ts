import { ar } from "./ar";
import { en } from "./en";
import type { Dictionary, Locale } from "./types";

export type { Dictionary, Locale };

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export const DEFAULT_LOCALE: Locale = "en";

export const getDictionary = (locale: Locale): Dictionary =>
  dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

export const localeDirection = (locale: Locale): "ltr" | "rtl" =>
  locale === "ar" ? "rtl" : "ltr";

export const isLocale = (value: string | null | undefined): value is Locale =>
  value === "en" || value === "ar";
