"use client";

import { useId, useState } from "react";

import { uploadMedia } from "@/lib/admin-api";

type MediaUploadFieldProps = {
  id?: string;
  label: string;
  value: string;
  kind?: "image" | "video";
  accept?: string;
  disabled?: boolean;
  showUrlInput?: boolean;
  onChange: (url: string) => void;
  onKindDetect?: (kind: "image" | "video") => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

export const MediaUploadField = ({
  id,
  label,
  value,
  kind,
  accept = "image/*,video/*",
  disabled = false,
  showUrlInput = true,
  onChange,
  onKindDetect,
  onError,
  onSuccess,
}: MediaUploadFieldProps): React.JSX.Element => {
  const autoId = useId();
  const fieldId = id || autoId;
  const fileInputId = `${fieldId}-file`;
  const [uploading, setUploading] = useState(false);

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const asset = await uploadMedia(file, file.name);
      const url = asset.url || asset.public_url || "";
      if (!url) {
        throw new Error("Upload succeeded but no public URL was returned.");
      }
      onChange(url);
      if (onKindDetect) {
        onKindDetect(file.type.startsWith("video") ? "video" : "image");
      }
      onSuccess?.("File uploaded from your PC.");
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Upload from PC failed.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="admin-field admin-media-upload-field">
      <label htmlFor={showUrlInput ? fieldId : fileInputId}>{label}</label>
      {showUrlInput ? (
        <input
          id={fieldId}
          value={value}
          disabled={disabled || uploading}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload from PC"
        />
      ) : null}
      <div className="admin-media-upload-row">
        <label
          className="admin-btn admin-btn-secondary admin-upload-trigger"
          htmlFor={fileInputId}
        >
          {uploading ? "Uploading…" : "Upload from PC"}
          <input
            id={fileInputId}
            type="file"
            accept={accept}
            hidden
            disabled={disabled || uploading}
            onChange={handleFile}
          />
        </label>
        {value ? (
          <span className="admin-muted admin-upload-hint" title={value}>
            File ready
          </span>
        ) : (
          <span className="admin-muted admin-upload-hint">
            Choose an image or video from this computer
          </span>
        )}
      </div>
      {value ? (
        kind === "video" ||
        (!kind && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(value)) ? (
          <video className="admin-preview" src={value} controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="admin-preview" src={value} alt="" />
        )
      ) : null}
    </div>
  );
};
