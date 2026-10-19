"use client";

import { useId, useState } from "react";

import {
  MEDIA_LIMITS,
  detectMediaKind,
  mediaHint,
} from "@/lib/admin-media-guide";
import { uploadMedia } from "@/lib/admin-api";

type MediaUploadFieldProps = {
  id?: string;
  label: string;
  value: string;
  kind?: "image" | "video";
  /** Restrict picker + help text */
  mode?: "image" | "video" | "both";
  hint?: string;
  accept?: string;
  disabled?: boolean;
  showUrlInput?: boolean;
  onChange: (url: string) => void;
  onKindDetect?: (kind: "image" | "video") => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

const acceptForMode = (mode: "image" | "video" | "both"): string => {
  if (mode === "image") return MEDIA_LIMITS.imageAccept;
  if (mode === "video") return MEDIA_LIMITS.videoAccept;
  return MEDIA_LIMITS.allAccept;
};

export const MediaUploadField = ({
  id,
  label,
  value,
  kind,
  mode = "both",
  hint,
  accept,
  disabled = false,
  showUrlInput = false,
  onChange,
  onKindDetect,
  onError,
  onSuccess,
}: MediaUploadFieldProps): React.JSX.Element => {
  const autoId = useId();
  const fieldId = id || autoId;
  const fileInputId = `${fieldId}-file`;
  const [uploading, setUploading] = useState(false);
  const resolvedAccept = accept || acceptForMode(mode);
  const helpText = hint || mediaHint(mode);

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxBytes = MEDIA_LIMITS.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      onError?.(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max ${MEDIA_LIMITS.maxSizeMb} MB.`,
      );
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const asset = await uploadMedia(file, file.name);
      const url = asset.url || asset.public_url || "";
      if (!url) {
        throw new Error("Upload worked but no file link came back. Try again.");
      }
      const detected = detectMediaKind({
        url,
        fileName: file.name,
        fileType: file.type,
      });
      onChange(url);
      onKindDetect?.(detected);
      onSuccess?.("Upload complete — click Save & publish to update the live site.");
    } catch (err) {
      onError?.(
        err instanceof Error
          ? err.message
          : "Upload failed. Check format and size, then try again.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const isVideo =
    detectMediaKind({ url: value, kind }) === "video";

  return (
    <div className="admin-field admin-media-upload-field">
      <label htmlFor={showUrlInput ? fieldId : fileInputId}>{label}</label>
      <p className="admin-field-hint">{helpText}</p>

      {showUrlInput ? (
        <input
          id={fieldId}
          value={value}
          disabled={disabled || uploading}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste a file link here (optional)"
        />
      ) : null}

      <div className="admin-media-upload-row">
        <label
          className="admin-btn admin-btn-secondary admin-upload-trigger"
          htmlFor={fileInputId}
        >
          {uploading
            ? "Uploading…"
            : mode === "video"
              ? "Choose video from computer"
              : mode === "image"
                ? "Choose image from computer"
                : "Choose image or video"}
          <input
            id={fileInputId}
            type="file"
            accept={resolvedAccept}
            hidden
            disabled={disabled || uploading}
            onChange={handleFile}
          />
        </label>
        {value ? (
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
          >
            Remove
          </button>
        ) : null}
        <span className="admin-muted admin-upload-hint">
          {value
            ? "File ready — preview below"
            : `Max ${MEDIA_LIMITS.maxSizeMb} MB`}
        </span>
      </div>

      {value ? (
        isVideo ? (
          <video className="admin-preview" src={value} controls playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="admin-preview" src={value} alt="Upload preview" />
        )
      ) : (
        <div className="admin-preview-empty">No file selected yet</div>
      )}
    </div>
  );
};
