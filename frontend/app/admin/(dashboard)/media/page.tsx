"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { deleteMedia, listMedia, uploadMedia } from "@/lib/admin-api";
import type { MediaAsset } from "@/types/cms";

export default function AdminMediaPage(): React.JSX.Element {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [booting, setBooting] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const form = useAdminForm();

  const reload = useCallback(async (): Promise<void> => {
    const rows = await listMedia();
    setAssets(Array.isArray(rows) ? rows : []);
  }, []);

  useEffect(() => {
    reload()
      .catch((err) =>
        form.setStatus({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load media",
          success: null,
        }),
      )
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  const onUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    await form.run(async () => {
      await uploadMedia(file, file.name);
      await reload();
    }, "Upload complete.");
    event.target.value = "";
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this media asset?")) return;
    await form.run(async () => {
      await deleteMedia(id);
      await reload();
    }, "Media deleted.");
  };

  const copyUrl = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  if (booting) {
    return <div className="admin-loading">Loading media library…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Media</h1>
          <p>Upload assets and copy public URLs into settings or gallery.</p>
        </div>
        <div className="admin-actions">
          <label className="admin-btn" style={{ cursor: "pointer" }}>
            {form.loading ? "Uploading…" : "Upload file"}
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={onUpload}
              disabled={form.loading}
            />
          </label>
        </div>
      </div>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success || (copied ? "URL copied." : null)} />

      {previewUrl ? (
        <div className="admin-card">
          <h2>Upload preview</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="admin-preview" src={previewUrl} alt="Upload preview" />
        </div>
      ) : null}

      {assets.length === 0 ? (
        <div className="admin-card">
          <p className="admin-muted">No media uploaded yet.</p>
        </div>
      ) : (
        <div className="admin-media-grid">
          {assets.map((asset) => {
            const isVideo = (asset.mime_type || asset.mime || "").startsWith(
              "video",
            );
            const src = asset.url || asset.public_url || "";
            return (
              <div className="admin-media-card" key={asset.id}>
                {isVideo ? (
                  <video src={src} controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={asset.alt || ""} />
                )}
                <div className="meta">
                  <code>{src}</code>
                  <div className="admin-row-actions">
                    <button
                      className="admin-btn admin-btn-secondary"
                      type="button"
                      onClick={() => copyUrl(src)}
                    >
                      Copy URL
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      type="button"
                      onClick={() => onDelete(asset.id)}
                      disabled={form.loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
