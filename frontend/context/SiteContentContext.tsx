"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { dictionaries as fallbackDictionaries, type Dictionary, type Locale } from "@/data/dictionary";
import { SITE_CONFIG } from "@/data/site-config";
import type { CmsSiteConfig } from "@/types/cms";

type SiteContentValue = {
  siteConfig: CmsSiteConfig;
  dictionaries: Record<Locale, Dictionary>;
};

const SiteContentContext = createContext<SiteContentValue | null>(null);

const FALLBACK_VALUE: SiteContentValue = {
  siteConfig: SITE_CONFIG,
  dictionaries: fallbackDictionaries,
};

type SiteContentProviderProps = {
  siteConfig: CmsSiteConfig;
  dictionaries: Record<Locale, Dictionary>;
  children: ReactNode;
};

export const SiteContentProvider = ({
  siteConfig,
  dictionaries,
  children,
}: SiteContentProviderProps): React.JSX.Element => (
  <SiteContentContext.Provider value={{ siteConfig, dictionaries }}>
    {children}
  </SiteContentContext.Provider>
);

export const useSiteContent = (): SiteContentValue =>
  useContext(SiteContentContext) ?? FALLBACK_VALUE;

export const useSiteContentOptional = (): SiteContentValue | null =>
  useContext(SiteContentContext);
