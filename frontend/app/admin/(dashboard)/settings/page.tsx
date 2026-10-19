"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { useAdminForm } from "@/components/admin/useAdminForm";
import {
  getAdminContent,
  publishSection,
  saveSettingsDraft,
} from "@/lib/admin-api";
import { HOW_TO_PUBLISH, mediaHint } from "@/lib/admin-media-guide";
import type { CmsSiteSettings } from "@/types/cms";

const SLOT_LABELS: Record<"hero" | "story" | "cta", string> = {
  hero: "Hero (top of homepage)",
  story: "Our Story section",
  cta: "Booking / CTA section",
};

const emptySettings = (): CmsSiteSettings => ({
  logoSrc: "",
  bookingUrl: "",
  phoneTel: "",
  phoneDisplay: "",
  email: "",
  whatsappUrl: "",
  instagramUrl: "",
  developerUrl: "",
  googleReviewsUrl: "",
  mapsSearchUrl: "",
  mapsEmbedUrl: "",
  address: {
    street: "",
    shop: "",
    locality: "",
    postalCode: "",
    country: "",
    countryCode: "",
  },
  currency: "BD",
  siteUrl: "",
  themeColor: "#1C1C1B",
  seoKeywords: [],
  images: {
    hero: { src: "", alt: "", kind: "image" },
    story: { src: "", alt: "", kind: "image" },
    cta: { src: "", alt: "", kind: "image" },
  },
});

export default function AdminSettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState<CmsSiteSettings>(emptySettings);
  const [keywordsText, setKeywordsText] = useState("");
  const [booting, setBooting] = useState(true);
  const form = useAdminForm();

  useEffect(() => {
    getAdminContent()
      .then((content) => {
        const draft = {
          ...emptySettings(),
          ...content.settings.draft,
          address: {
            ...emptySettings().address,
            ...(content.settings.draft.address || {}),
          },
          images: {
            ...emptySettings().images,
            ...(content.settings.draft.images || {}),
          },
        };
        setSettings(draft);
        setKeywordsText((draft.seoKeywords || []).join(", "));
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

  const patch = <K extends keyof CmsSiteSettings>(
    key: K,
    value: CmsSiteSettings[K],
  ): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const onSaveAndPublish = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await form.run(async () => {
      const payload = {
        ...settings,
        seoKeywords: keywordsText
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };
      await saveSettingsDraft(payload);
      await publishSection("settings");
    }, "Saved and published to the live site.");
  };

  if (booting) {
    return <div className="admin-loading">Loading settings…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Logo & contact</h1>
          <p>
            Shop phone, WhatsApp, address, logo, and main homepage photos /
            videos.
          </p>
        </div>
        <div className="admin-actions">
          <button
            className="admin-btn"
            type="submit"
            form="settings-form"
            disabled={form.loading}
          >
            {form.loading ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      <AdminGuide
        title="On this page"
        steps={[
          "Update phone / WhatsApp / Instagram links if they change.",
          "Upload a new logo (PNG or JPG recommended).",
          "Replace hero, story or CTA media with Upload buttons below.",
          "Click Save & publish — the live site updates.",
        ]}
      >
        <p>{mediaHint("both")}</p>
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <form id="settings-form" onSubmit={onSaveAndPublish}>
        <div className="admin-card">
          <h2>Logo & contact details</h2>
          <div className="admin-grid admin-grid-2">
            <MediaUploadField
              id="logoSrc"
              label="Shop logo"
              value={settings.logoSrc}
              mode="image"
              hint="Logo image only (PNG or JPG works best). Transparent PNG looks clean. Max 25 MB."
              disabled={form.loading}
              onChange={(url) => patch("logoSrc", url)}
              onError={(message) =>
                form.setStatus({
                  loading: false,
                  error: message,
                  success: null,
                })
              }
              onSuccess={(message) =>
                form.setStatus({
                  loading: false,
                  error: null,
                  success: message,
                })
              }
            />
            <div className="admin-field">
              <label htmlFor="bookingUrl">Online booking link (optional)</label>
              <input
                id="bookingUrl"
                value={settings.bookingUrl}
                onChange={(e) => patch("bookingUrl", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="phoneTel">Phone (tel:)</label>
              <input
                id="phoneTel"
                value={settings.phoneTel}
                onChange={(e) => patch("phoneTel", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="phoneDisplay">Phone display</label>
              <input
                id="phoneDisplay"
                value={settings.phoneDisplay}
                onChange={(e) => patch("phoneDisplay", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={settings.email || ""}
                onChange={(e) => patch("email", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="whatsappUrl">WhatsApp URL</label>
              <input
                id="whatsappUrl"
                value={settings.whatsappUrl}
                onChange={(e) => patch("whatsappUrl", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="instagramUrl">Instagram URL</label>
              <input
                id="instagramUrl"
                value={settings.instagramUrl}
                onChange={(e) => patch("instagramUrl", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="googleReviewsUrl">Google reviews URL</label>
              <input
                id="googleReviewsUrl"
                value={settings.googleReviewsUrl}
                onChange={(e) => patch("googleReviewsUrl", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="developerUrl">Developer URL</label>
              <input
                id="developerUrl"
                value={settings.developerUrl}
                onChange={(e) => patch("developerUrl", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="siteUrl">Site URL</label>
              <input
                id="siteUrl"
                value={settings.siteUrl || ""}
                onChange={(e) => patch("siteUrl", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2>Address & maps</h2>
          <div className="admin-grid admin-grid-2">
            {(
              [
                ["street", "Street"],
                ["shop", "Shop"],
                ["locality", "Locality"],
                ["postalCode", "Postal code"],
                ["country", "Country"],
                ["countryCode", "Country code"],
              ] as const
            ).map(([key, label]) => (
              <div className="admin-field" key={key}>
                <label htmlFor={`addr-${key}`}>{label}</label>
                <input
                  id={`addr-${key}`}
                  value={settings.address[key]}
                  onChange={(e) =>
                    patch("address", {
                      ...settings.address,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <div className="admin-field">
              <label htmlFor="mapsSearchUrl">Maps search URL</label>
              <input
                id="mapsSearchUrl"
                value={settings.mapsSearchUrl}
                onChange={(e) => patch("mapsSearchUrl", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="mapsEmbedUrl">Maps embed URL</label>
              <input
                id="mapsEmbedUrl"
                value={settings.mapsEmbedUrl}
                onChange={(e) => patch("mapsEmbedUrl", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2>SEO</h2>
          <div className="admin-field">
            <label htmlFor="themeColor">Theme color</label>
            <input
              id="themeColor"
              value={settings.themeColor || ""}
              onChange={(e) => patch("themeColor", e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="seoKeywords">Keywords (comma separated)</label>
            <textarea
              id="seoKeywords"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-card">
          <h2>Homepage photos & videos</h2>
          <p className="admin-field-hint">
            These appear on the public homepage. Use a short video or a clear
            photo. {mediaHint("both")}
          </p>
          {(["hero", "story", "cta"] as const).map((slot) => (
            <div key={slot} className="admin-item" style={{ marginBottom: 12 }}>
              <div className="admin-item-head">
                <strong>{SLOT_LABELS[slot]}</strong>
              </div>
              <MediaUploadField
                id={`${slot}-src`}
                label="Upload photo or video"
                value={settings.images[slot]?.src || ""}
                kind={settings.images[slot]?.kind || "image"}
                mode="both"
                disabled={form.loading}
                onChange={(url) =>
                  patch("images", {
                    ...settings.images,
                    [slot]: {
                      ...settings.images[slot],
                      src: url,
                    },
                  })
                }
                onKindDetect={(kind) =>
                  patch("images", {
                    ...settings.images,
                    [slot]: {
                      ...settings.images[slot],
                      kind,
                    },
                  })
                }
                onError={(message) =>
                  form.setStatus({
                    loading: false,
                    error: message,
                    success: null,
                  })
                }
                onSuccess={(message) =>
                  form.setStatus({
                    loading: false,
                    error: null,
                    success: message,
                  })
                }
              />
              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label htmlFor={`${slot}-alt`}>
                    Short description (for accessibility)
                  </label>
                  <input
                    id={`${slot}-alt`}
                    value={settings.images[slot]?.alt || ""}
                    onChange={(e) =>
                      patch("images", {
                        ...settings.images,
                        [slot]: {
                          ...settings.images[slot],
                          alt: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Barber finishing a fade"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`${slot}-kind`}>This file is a…</label>
                  <select
                    id={`${slot}-kind`}
                    value={settings.images[slot]?.kind || "image"}
                    onChange={(e) =>
                      patch("images", {
                        ...settings.images,
                        [slot]: {
                          ...settings.images[slot],
                          kind: e.target.value as "image" | "video",
                        },
                      })
                    }
                  >
                    <option value="image">Photo / image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </>
  );
}
