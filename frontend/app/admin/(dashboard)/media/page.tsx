"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { deleteMedia, listMedia, uploadMedia } from "@/lib/admin-api";
import { MEDIA_LIMITS, mediaHint } from "@/lib/admin-media-guide";
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
          error: err instanceof Error ? err.message : "Could not load uploads",
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

    const maxBytes = MEDIA_LIMITS.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      form.setStatus({
        loading: false,
        error: `File too large. Max ${MEDIA_LIMITS.maxSizeMb} MB.`,
        success: null,
      });
      event.target.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    await form.run(async () => {
      await uploadMedia(file, file.name);
      await reload();
    }, "Upload complete. You can copy the link if needed.");
    event.target.value = "";
  };

  const onDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this file from the library?")) return;
    await form.run(async () => {
      await deleteMedia(id);
      await reload();
    }, "File deleted.");
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
    return <div className="admin-loading">Loading uploads…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>All uploads</h1>
          <p>
            Every photo and video you upload is listed here. Most of the time
            you can upload directly inside Logo & contact or Gallery instead.
          </p>
        </div>
        <div className="admin-actions">
          <label className="admin-btn" style={{ cursor: "pointer" }}>
            {form.loading ? "Uploading…" : "Upload from computer"}
            <input
              type="file"
              accept={MEDIA_LIMITS.allAccept}
              hidden
              onChange={onUpload}
              disabled={form.loading}
            />
          </label>
        </div>
      </div>

      <AdminGuide title="File rules">
        <p>{mediaHint("both")}</p>
        <p>
          Tip: prefer JPG/PNG for photos and MP4 for videos. Keep files under{" "}
          {MEDIA_LIMITS.maxSizeMb} MB so the website stays fast.
        </p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus
        type="success"
        message={form.success || (copied ? "Link copied." : null)}
      />

      {previewUrl ? (
        <div className="admin-card">
          <h2>Just uploaded (preview)</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="admin-preview" src={previewUrl} alt="Upload preview" />
        </div>
      ) : null}

      {assets.length === 0 ? (
        <div className="admin-card">
          <p className="admin-muted">No uploads yet. Use the button above.</p>
        </div>
      ) : (
        <div className="admin-media-grid">
          {assets.map((asset) => {
            const url = asset.url || asset.public_url || "";
            const isVideo = (asset.mime || "").startsWith("video");
            return (
              <div className="admin-media-card" key={asset.id}>
                {isVideo ? (
                  <video src={url} muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={asset.alt || ""} />
                )}
                <div className="meta">
                  <code>{url}</code>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => copyUrl(url)}
                    >
                      Copy link
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      disabled={form.loading}
                      onClick={() => onDelete(asset.id)}
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
