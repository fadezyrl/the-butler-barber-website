"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { useAdminForm } from "@/components/admin/useAdminForm";
import type { Dictionary, Locale } from "@/data/dictionary";
import {
  deleteTeamMember,
  getAdminContent,
  publishSection,
  saveLocaleDraft,
  upsertTeamMember,
} from "@/lib/admin-api";
import { HOW_TO_PUBLISH } from "@/lib/admin-media-guide";

type TeamRow = {
  id: string;
  slug: string;
  media_url: string;
  draft_media_url: string;
  draft_kind: "image" | "video";
  draft_name: string;
  draft_role_en: string;
  draft_role_ar: string;
  draft_bio_en: string;
  draft_bio_ar: string;
  draft_alt_en: string;
  draft_alt_ar: string;
  draft_sort_order: number;
  draft_is_visible: boolean;
};

type TeamSectionCopy = {
  titleLead: string;
  titleEm: string;
  intro: string;
};

const emptySection = (): TeamSectionCopy => ({
  titleLead: "",
  titleEm: "",
  intro: "",
});

export default function AdminTeamPage(): React.JSX.Element {
  const [items, setItems] = useState<TeamRow[]>([]);
  const [locale, setLocale] = useState<Locale>("en");
  const [sectionCopy, setSectionCopy] = useState<
    Record<Locale, TeamSectionCopy>
  >({
    en: emptySection(),
    ar: emptySection(),
  });
  const [localeDrafts, setLocaleDrafts] = useState<Record<
    Locale,
    Dictionary
  > | null>(null);
  const [booting, setBooting] = useState(true);
  const form = useAdminForm();

  const reload = useCallback(async (): Promise<void> => {
    const content = await getAdminContent();
    setItems((content.team || []) as unknown as TeamRow[]);
    const en = content.locales.en.draft;
    const ar = content.locales.ar.draft;
    setLocaleDrafts({ en, ar });
    setSectionCopy({
      en: {
        titleLead: en.team?.titleLead || "",
        titleEm: en.team?.titleEm || "",
        intro: en.team?.intro || "",
      },
      ar: {
        titleLead: ar.team?.titleLead || "",
        titleEm: ar.team?.titleEm || "",
        intro: ar.team?.intro || "",
      },
    });
  }, []);

  useEffect(() => {
    reload()
      .catch((err) =>
        form.setStatus({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load",
          success: null,
        }),
      )
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  const patchItem = (id: string, patch: Partial<TeamRow>): void => {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const saveItem = async (item: TeamRow): Promise<void> => {
    await form.run(async () => {
      await upsertTeamMember({
        id: item.id,
        slug: item.slug,
        mediaUrl: item.draft_media_url || item.media_url,
        kind: item.draft_kind,
        name: item.draft_name,
        roleEn: item.draft_role_en,
        roleAr: item.draft_role_ar,
        bioEn: item.draft_bio_en,
        bioAr: item.draft_bio_ar,
        altEn: item.draft_alt_en || item.draft_name,
        altAr: item.draft_alt_ar || item.draft_name,
        sortOrder: item.draft_sort_order,
        isVisible: item.draft_is_visible,
      });
      await publishSection("team");
      await reload();
    }, "Saved and published to the live site.");
  };

  const addItem = async (): Promise<void> => {
    await form.run(async () => {
      await upsertTeamMember({
        name: "New team member",
        roleEn: "",
        roleAr: "",
        bioEn: "",
        bioAr: "",
        mediaUrl: "",
        kind: "image",
        sortOrder: items.length,
        isVisible: true,
      });
      await reload();
    }, "Team member created.");
  };

  const removeItem = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this team member?")) return;
    await form.run(async () => {
      await deleteTeamMember(id);
      await reload();
    }, "Team member deleted.");
  };

  const saveSectionCopy = async (): Promise<void> => {
    if (!localeDrafts) return;
    await form.run(async () => {
      for (const loc of ["en", "ar"] as Locale[]) {
        const nextDict: Dictionary = {
          ...localeDrafts[loc],
          team: {
            ...(localeDrafts[loc].team || {
              titleLead: "",
              titleEm: "",
              intro: "",
              members: {},
            }),
            titleLead: sectionCopy[loc].titleLead,
            titleEm: sectionCopy[loc].titleEm,
            intro: sectionCopy[loc].intro,
            members: localeDrafts[loc].team?.members || {},
          },
        };
        await saveLocaleDraft(
          loc,
          nextDict as unknown as Record<string, unknown>,
        );
      }
      await publishSection("locales");
      await reload();
    }, "Section text saved and published.");
  };

  const onSaveAndPublish = async (): Promise<void> => {
    await form.run(async () => {
      await publishSection("team");
      await publishSection("locales");
    }, "Saved and published to the live site.");
  };

  if (booting) {
    return <div className="admin-loading">Loading team…</div>;
  }

  const currentSection = sectionCopy[locale];

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Our Team</h1>
          <p>People shown in the Our Team section on the homepage.</p>
        </div>
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            onClick={addItem}
            disabled={form.loading}
          >
            Add member
          </button>
          <button
            className="admin-btn admin-btn-save"
            type="button"
            onClick={onSaveAndPublish}
            disabled={form.loading}
          >
            Save & publish
          </button>
        </div>
      </div>

      <AdminGuide
        title="How to edit Our Team"
        steps={[
          "Update the section title and intro for English / Arabic, then save section text.",
          "For each person: upload a photo, set name, role, and bio.",
          "Click Save on that card — it goes live immediately.",
        ]}
      >
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <div className="admin-item" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-item-head">
          <strong>Section title & intro</strong>
          <div className="admin-row-actions">
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
              onClick={saveSectionCopy}
              disabled={form.loading}
            >
              Save section text
            </button>
          </div>
        </div>
        <div className="admin-grid admin-grid-2">
          <div className="admin-field">
            <label>Title lead</label>
            <input
              value={currentSection.titleLead}
              dir={locale === "ar" ? "rtl" : undefined}
              onChange={(e) =>
                setSectionCopy((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], titleLead: e.target.value },
                }))
              }
            />
          </div>
          <div className="admin-field">
            <label>Title emphasis</label>
            <input
              value={currentSection.titleEm}
              dir={locale === "ar" ? "rtl" : undefined}
              onChange={(e) =>
                setSectionCopy((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], titleEm: e.target.value },
                }))
              }
            />
          </div>
        </div>
        <div className="admin-field">
          <label>Intro</label>
          <textarea
            value={currentSection.intro}
            dir={locale === "ar" ? "rtl" : undefined}
            onChange={(e) =>
              setSectionCopy((prev) => ({
                ...prev,
                [locale]: { ...prev[locale], intro: e.target.value },
              }))
            }
          />
        </div>
      </div>

      <div className="admin-list">
        {items
          .slice()
          .sort((a, b) => a.draft_sort_order - b.draft_sort_order)
          .map((item) => (
            <div className="admin-item" key={item.id}>
              <div className="admin-item-head">
                <strong>{item.draft_name || "Untitled"}</strong>
                <div className="admin-row-actions">
                  <button
                    className="admin-btn admin-btn-secondary"
                    type="button"
                    onClick={() => saveItem(item)}
                    disabled={form.loading}
                  >
                    Save
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={form.loading}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <MediaUploadField
                label="Photo"
                value={item.draft_media_url || item.media_url}
                kind={item.draft_kind}
                mode="image"
                onChange={(url) =>
                  patchItem(item.id, {
                    draft_media_url: url,
                    draft_kind: "image",
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
                  <label>Name</label>
                  <input
                    value={item.draft_name}
                    onChange={(e) =>
                      patchItem(item.id, { draft_name: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Sort order</label>
                  <input
                    type="number"
                    value={item.draft_sort_order}
                    onChange={(e) =>
                      patchItem(item.id, {
                        draft_sort_order: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Role (EN)</label>
                  <input
                    value={item.draft_role_en}
                    onChange={(e) =>
                      patchItem(item.id, { draft_role_en: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Role (AR)</label>
                  <input
                    dir="rtl"
                    value={item.draft_role_ar}
                    onChange={(e) =>
                      patchItem(item.id, { draft_role_ar: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label>Bio (EN)</label>
                <textarea
                  value={item.draft_bio_en}
                  onChange={(e) =>
                    patchItem(item.id, { draft_bio_en: e.target.value })
                  }
                />
              </div>
              <div className="admin-field">
                <label>Bio (AR)</label>
                <textarea
                  dir="rtl"
                  value={item.draft_bio_ar}
                  onChange={(e) =>
                    patchItem(item.id, { draft_bio_ar: e.target.value })
                  }
                />
              </div>

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={item.draft_is_visible}
                  onChange={(e) =>
                    patchItem(item.id, {
                      draft_is_visible: e.target.checked,
                    })
                  }
                />
                Visible
              </label>
            </div>
          ))}
      </div>
    </>
  );
}
