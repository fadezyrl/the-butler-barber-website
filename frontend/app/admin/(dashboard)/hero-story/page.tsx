"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { HOW_TO_PUBLISH } from "@/lib/admin-media-guide";
import type { Dictionary, Locale } from "@/data/dictionary";
import {
  getAdminContent,
  publishSection,
  saveLocaleDraft,
} from "@/lib/admin-api";

type SectionKey = "hero" | "story" | "cta";

const SECTION_FIELDS: Record<SectionKey, string[]> = {
  hero: [
    "titleLead",
    "titleEm",
    "sub",
    "exploreWork",
    "meta",
    "openStrong",
    "openRest",
    "addressLine",
    "photoCaption",
  ],
  story: [
    "titleLead",
    "titleEm",
    "p1",
    "p2",
    "lineLead",
    "lineEm",
    "photoCaption",
  ],
  cta: ["title", "body"],
};

export default function AdminHeroStoryPage(): React.JSX.Element {
  const [locale, setLocale] = useState<Locale>("en");
  const [drafts, setDrafts] = useState<Record<Locale, Dictionary> | null>(null);
  const [booting, setBooting] = useState(true);
  const form = useAdminForm();

  useEffect(() => {
    getAdminContent()
      .then((content) => {
        setDrafts({
          en: content.locales.en.draft,
          ar: content.locales.ar.draft,
        });
      })
      .catch((err) =>
        form.setStatus({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load",
          success: null,
        }),
      )
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = drafts?.[locale];

  const setField = (
    section: SectionKey,
    key: string,
    value: string,
  ): void => {
    if (!drafts) return;
    setDrafts({
      ...drafts,
      [locale]: {
        ...drafts[locale],
        [section]: {
          ...(drafts[locale][section] as Record<string, string>),
          [key]: value,
        },
      },
    });
  };

  const onSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!drafts) return;
    await form.run(
      () => saveLocaleDraft(locale, drafts[locale] as unknown as Record<string, unknown>),
      `${locale.toUpperCase()} hero/story draft saved.`,
    );
  };

  const onPublish = async (): Promise<void> => {
    if (!drafts) return;
    await form.run(async () => {
      await saveLocaleDraft(
        locale,
        drafts[locale] as unknown as Record<string, unknown>,
      );
      await publishSection("locales");
    }, "Locales published.");
  };

  if (booting || !current) {
    return <div className="admin-loading">Loading copy…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Homepage text</h1>
          <p>
            Change the big headlines and paragraphs at the top of the website
            (English and Arabic).
          </p>
        </div>
        <div className="admin-actions">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            disabled={form.loading}
            onClick={onPublish}
          >
            Save & publish
          </button>
          <button
            className="admin-btn"
            type="submit"
            form="hero-story-form"
            disabled={form.loading}
          >
            {form.loading ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>

      <AdminGuide
        title="How to edit text"
        steps={[
          "Choose English or Arabic from the dropdown.",
          "Change any box — keep sentences clear and short.",
          "Save draft, then Save & publish for the live site.",
          "To change the hero video/photo, go to Logo & contact.",
        ]}
      >
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <form id="hero-story-form" onSubmit={onSave}>
        {(Object.keys(SECTION_FIELDS) as SectionKey[]).map((section) => (
          <div className="admin-card" key={section}>
            <h2>{section}</h2>
            {SECTION_FIELDS[section].map((field) => {
              const value =
                (current[section] as Record<string, string>)?.[field] || "";
              const multiline = value.length > 80 || field.startsWith("p");
              return (
                <div className="admin-field" key={`${section}-${field}`}>
                  <label htmlFor={`${section}-${field}`}>{field}</label>
                  {multiline ? (
                    <textarea
                      id={`${section}-${field}`}
                      value={value}
                      onChange={(e) => setField(section, field, e.target.value)}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    />
                  ) : (
                    <input
                      id={`${section}-${field}`}
                      value={value}
                      onChange={(e) => setField(section, field, e.target.value)}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </form>
    </>
  );
}
