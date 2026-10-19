"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { useAdminForm } from "@/components/admin/useAdminForm";
import {
  deleteGalleryItem,
  getAdminContent,
  publishSection,
  uploadMedia,
  upsertGalleryItem,
} from "@/lib/admin-api";
import {
  HOW_TO_PUBLISH,
  MEDIA_LIMITS,
  detectMediaKind,
  mediaHint,
} from "@/lib/admin-media-guide";

type GalleryRow = {
  id: string;
  draft_media_url: string;
  media_url: string;
  draft_kind: "image" | "video";
  draft_alt_en: string;
  draft_alt_ar: string;
  draft_sort_order: number;
  draft_is_visible: boolean;
};

export default function AdminGalleryPage(): React.JSX.Element {
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [booting, setBooting] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const form = useAdminForm();

  const reload = useCallback(async (): Promise<void> => {
    const content = await getAdminContent();
    setItems(content.gallery as unknown as GalleryRow[]);
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

  const saveItem = async (item: GalleryRow): Promise<void> => {
    await form.run(async () => {
      await upsertGalleryItem({
        id: item.id,
        mediaUrl: item.draft_media_url || item.media_url,
        kind: item.draft_kind,
        altEn: item.draft_alt_en,
        altAr: item.draft_alt_ar,
        sortOrder: item.draft_sort_order,
        isVisible: item.draft_is_visible,
      });
      await publishSection("gallery");
      await reload();
    }, "Saved and published to the live site.");
  };

  const addFromUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    const kind = detectMediaKind({
      fileName: file.name,
      fileType: file.type,
    });
    setPreviewIsVideo(kind === "video");
    setPreviewUrl(URL.createObjectURL(file));
    await form.run(async () => {
      const asset = await uploadMedia(file, file.name);
      await upsertGalleryItem({
        mediaUrl: asset.url,
        kind,
        altEn: file.name,
        altAr: file.name,
        sortOrder: items.length,
        isVisible: true,
      });
      await reload();
    }, "Gallery item uploaded.");
    event.target.value = "";
  };

  const addBlank = async (): Promise<void> => {
    const url = window.prompt("Media URL");
    if (!url) return;
    await form.run(async () => {
      await upsertGalleryItem({
        mediaUrl: url.trim(),
        kind: "image",
        altEn: "",
        altAr: "",
        sortOrder: items.length,
        isVisible: true,
      });
      await reload();
    }, "Gallery item added.");
  };

  const removeItem = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this gallery item?")) return;
    await form.run(async () => {
      await deleteGalleryItem(id);
      await reload();
    }, "Gallery item deleted.");
  };

  const onSaveAndPublish = async (): Promise<void> => {
    await form.run(
      () => publishSection("gallery"),
      "Saved and published to the live site.",
    );
  };

  if (booting) {
    return <div className="admin-loading">Loading gallery…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Gallery</h1>
          <p>
            Photos and videos in the “Our Work” section on the homepage.
          </p>
        </div>
        <div className="admin-actions">
          <label className="admin-btn admin-btn-secondary" style={{ cursor: "pointer" }}>
            {form.loading ? "Uploading…" : "Add photo / video"}
            <input
              type="file"
              accept={MEDIA_LIMITS.allAccept}
              hidden
              disabled={form.loading}
              onChange={addFromUpload}
            />
          </label>
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            onClick={addBlank}
            disabled={form.loading}
          >
            Add from link (optional)
          </button>
          <button
            className="admin-btn"
            type="button"
            onClick={onSaveAndPublish}
            disabled={form.loading}
          >
            Save & publish
          </button>
        </div>
      </div>

      <AdminGuide
        title="How to change gallery images"
        steps={[
          "Click “Add photo / video” and pick a file from your computer.",
          "Write a short English (and Arabic if you want) description.",
          "Click Save on that item — it goes live immediately.",
        ]}
      >
        <p>{mediaHint("both")}</p>
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      {previewUrl ? (
        <div className="admin-card">
          <h2>Upload preview</h2>
          {previewIsVideo ? (
            <video
              className="admin-preview"
              src={previewUrl}
              controls
              playsInline
              muted
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="admin-preview"
              src={previewUrl}
              alt="Upload preview"
            />
          )}
        </div>
      ) : null}

      <div className="admin-list">
        {items
          .slice()
          .sort((a, b) => a.draft_sort_order - b.draft_sort_order)
          .map((item) => {
            const src = item.draft_media_url || item.media_url;
            return (
              <div className="admin-item" key={item.id}>
                <div className="admin-item-head">
                  <strong>#{item.draft_sort_order + 1}</strong>
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
                  id={`gallery-media-${item.id}`}
                  label="Replace photo or video"
                  value={src}
                  kind={item.draft_kind}
                  mode="both"
                  disabled={form.loading}
                  onChange={(url) =>
                    setItems((prev) =>
                      prev.map((g) =>
                        g.id === item.id
                          ? { ...g, draft_media_url: url }
                          : g,
                      ),
                    )
                  }
                  onKindDetect={(kind) =>
                    setItems((prev) =>
                      prev.map((g) =>
                        g.id === item.id ? { ...g, draft_kind: kind } : g,
                      ),
                    )
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
                    <label>This file is a…</label>
                    <select
                      value={item.draft_kind}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((g) =>
                            g.id === item.id
                              ? {
                                  ...g,
                                  draft_kind: e.target.value as
                                    | "image"
                                    | "video",
                                }
                              : g,
                          ),
                        )
                      }
                    >
                      <option value="image">Photo / image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Description (English)</label>
                    <input
                      value={item.draft_alt_en}
                      placeholder="e.g. Fresh skin fade"
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((g) =>
                            g.id === item.id
                              ? { ...g, draft_alt_en: e.target.value }
                              : g,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Description (Arabic)</label>
                    <input
                      value={item.draft_alt_ar}
                      dir="rtl"
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((g) =>
                            g.id === item.id
                              ? { ...g, draft_alt_ar: e.target.value }
                              : g,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.draft_is_visible}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((g) =>
                          g.id === item.id
                            ? { ...g, draft_is_visible: e.target.checked }
                            : g,
                        ),
                      )
                    }
                  />
                  Show on website
                </label>
              </div>
            );
          })}
      </div>
    </>
  );
}
