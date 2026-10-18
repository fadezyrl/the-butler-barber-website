"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AdminStatus } from "@/components/admin/AdminStatus";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { useAdminForm } from "@/components/admin/useAdminForm";
import {
  getAdminContent,
  publishSection,
  saveSettingsDraft,
} from "@/lib/admin-api";
import type { CmsSiteSettings } from "@/types/cms";

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

  const onSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const payload = {
      ...settings,
      seoKeywords: keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };
    await form.run(() => saveSettingsDraft(payload), "Settings draft saved.");
  };

  const onPublish = async (): Promise<void> => {
    await form.run(
      async () => {
        const payload = {
          ...settings,
          seoKeywords: keywordsText
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        };
        await saveSettingsDraft(payload);
        await publishSection("settings");
      },
      "Settings published.",
    );
  };

  if (booting) {
    return <div className="admin-loading">Loading settings…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Settings</h1>
          <p>Brand, contact, maps, SEO, and media slots.</p>
        </div>
        <div className="admin-actions">
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
            form="settings-form"
            disabled={form.loading}
          >
            {form.loading ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <form id="settings-form" onSubmit={onSave}>
        <div className="admin-card">
          <h2>Brand & contact</h2>
          <div className="admin-grid admin-grid-2">
            <MediaUploadField
              id="logoSrc"
              label="Logo"
              value={settings.logoSrc}
              accept="image/*"
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
              <label htmlFor="bookingUrl">Booking URL</label>
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
          <h2>Featured media</h2>
          <p className="admin-muted" style={{ marginTop: -6, marginBottom: 14 }}>
            Upload hero, story, and CTA images or videos from your PC.
          </p>
          {(["hero", "story", "cta"] as const).map((slot) => (
            <div key={slot} className="admin-item" style={{ marginBottom: 12 }}>
              <div className="admin-item-head">
                <strong>{slot}</strong>
              </div>
              <MediaUploadField
                id={`${slot}-src`}
                label="Media file"
                value={settings.images[slot]?.src || ""}
                kind={settings.images[slot]?.kind || "image"}
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
                  <label htmlFor={`${slot}-alt`}>Alt text</label>
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
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`${slot}-kind`}>Kind</label>
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
                    <option value="image">image</option>
                    <option value="video">video</option>
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
