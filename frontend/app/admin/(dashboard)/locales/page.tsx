"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import type { Dictionary, Locale } from "@/data/dictionary";
import {
  getAdminContent,
  publishSection,
  saveLocaleDraft,
} from "@/lib/admin-api";
import { HOW_TO_PUBLISH } from "@/lib/admin-media-guide";

type GroupKey =
  | "meta"
  | "brand"
  | "nav"
  | "a11y"
  | "gallery"
  | "reviews"
  | "contact"
  | "map"
  | "footer"
  | "lang";

const GROUPS: Array<{ key: GroupKey; label: string; fields: string[] }> = [
  {
    key: "meta",
    label: "SEO meta",
    fields: ["title", "description", "ogTitle", "ogDescription"],
  },
  {
    key: "brand",
    label: "Brand",
    fields: ["name", "wordmarkLead", "wordmarkTrail", "homeAria"],
  },
  {
    key: "nav",
    label: "Navbar labels",
    fields: ["story", "services", "work", "contact", "book"],
  },
  {
    key: "gallery",
    label: "Gallery labels",
    fields: ["title", "introLead", "introTrail", "instagram", "scrollHint"],
  },
  {
    key: "reviews",
    label: "Testimonials labels",
    fields: [
      "eyebrow",
      "emptyQuote",
      "emptyBody",
      "readOnGoogle",
      "slideLabel",
    ],
  },
  {
    key: "contact",
    label: "Contact labels",
    fields: ["title", "getDirections", "hoursTitle", "hoursNote"],
  },
  {
    key: "map",
    label: "Map labels",
    fields: ["eyebrow", "title", "openInMaps", "fallback", "pinLabel"],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      "statement",
      "explore",
      "visit",
      "reach",
      "rightsBrand",
      "developedBy",
      "developerName",
      "rightsTrail",
      "openEveryDay",
    ],
  },
  {
    key: "a11y",
    label: "Accessibility labels",
    fields: [
      "skipToContent",
      "openMenu",
      "closeMenu",
      "mainNav",
      "footerNav",
      "galleryTrack",
      "prevImages",
      "nextImages",
      "prevReview",
      "nextReview",
      "mapTitle",
      "whatsapp",
    ],
  },
  {
    key: "lang",
    label: "Language switcher",
    fields: ["en", "ar", "enFull", "arFull", "switchTo"],
  },
];

export default function AdminLocalesPage(): React.JSX.Element {
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

  const setField = (group: GroupKey, key: string, value: string): void => {
    if (!drafts) return;
    setDrafts({
      ...drafts,
      [locale]: {
        ...drafts[locale],
        [group]: {
          ...(drafts[locale][group] as Record<string, string>),
          [key]: value,
        },
      },
    });
  };

  const onSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!drafts) return;
    await form.run(
      () =>
        saveLocaleDraft(
          locale,
          drafts[locale] as unknown as Record<string, unknown>,
        ),
      `${locale.toUpperCase()} copy draft saved.`,
    );
  };

  const onPublish = async (): Promise<void> => {
    if (!drafts) return;
    await form.run(async () => {
      await saveLocaleDraft(
        locale,
        drafts[locale] as unknown as Record<string, unknown>,
      );
      return publishSection("locales");
    }, "Locale copy published. Site cache revalidated.");
  };

  if (booting || !current) {
    return <div className="admin-loading">Loading copy…</div>;
  }

  return (
    <div>
      <header className="admin-header">
        <div>
          <h1>Other website text</h1>
          <p>
            Menu labels, footer, contact headings, SEO title, and similar small
            texts. Homepage hero text is under Homepage text. Prices are under
            Services & prices.
          </p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className={
              locale === "en" ? "admin-btn" : "admin-btn admin-btn-secondary"
            }
            onClick={() => setLocale("en")}
          >
            English
          </button>
          <button
            type="button"
            className={
              locale === "ar" ? "admin-btn" : "admin-btn admin-btn-secondary"
            }
            onClick={() => setLocale("ar")}
          >
            Arabic
          </button>
        </div>
      </header>

      <AdminGuide
        title="Tips"
        steps={[
          "Switch English / Arabic with the buttons above.",
          "Only change the words you need — leave the rest.",
          "Save draft, then Publish copy for the live site.",
        ]}
      >
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <form onSubmit={onSave}>
        {GROUPS.map((group) => (
          <section className="admin-card" key={group.key}>
            <h2>{group.label}</h2>
            <div className="admin-grid admin-grid-2">
              {group.fields.map((field) => {
                const section = current[group.key] as Record<string, string>;
                const value = section?.[field] ?? "";
                const multiline =
                  field.toLowerCase().includes("description") ||
                  field === "statement" ||
                  field === "fallback" ||
                  field === "hoursNote" ||
                  field === "emptyBody";
                return (
                  <div
                    key={field}
                    className={`admin-field${multiline ? " admin-field-span" : ""}`}
                  >
                    <label htmlFor={`copy-${group.key}-${field}`}>{field}</label>
                    {multiline ? (
                      <textarea
                        id={`copy-${group.key}-${field}`}
                        rows={3}
                        value={value}
                        onChange={(e) =>
                          setField(group.key, field, e.target.value)
                        }
                      />
                    ) : (
                      <input
                        id={`copy-${group.key}-${field}`}
                        value={value}
                        onChange={(e) =>
                          setField(group.key, field, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="admin-actions">
          <button type="submit" className="admin-btn" disabled={form.loading}>
            {form.loading ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={form.loading}
            onClick={onPublish}
          >
            Publish copy
          </button>
        </div>
      </form>
    </div>
  );
}
