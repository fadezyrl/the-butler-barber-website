export const MEDIA_LIMITS = {
  maxSizeMb: 25,
  imageFormats: ["JPG", "PNG", "WEBP", "GIF"],
  videoFormats: ["MP4", "WEBM", "MOV"],
  imageAccept: "image/jpeg,image/png,image/webp,image/gif",
  videoAccept: "video/mp4,video/webm,video/quicktime",
  allAccept:
    "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime",
} as const;

export const mediaHint = (
  mode: "image" | "video" | "both" = "both",
): string => {
  if (mode === "image") {
    return `Images only: ${MEDIA_LIMITS.imageFormats.join(", ")}. Max ${MEDIA_LIMITS.maxSizeMb} MB. Tip: use a clear photo, not too dark.`;
  }
  if (mode === "video") {
    return `Videos only: ${MEDIA_LIMITS.videoFormats.join(", ")}. Max ${MEDIA_LIMITS.maxSizeMb} MB. Shorter clips load faster.`;
  }
  return `Allowed: images (${MEDIA_LIMITS.imageFormats.join(", ")}) or videos (${MEDIA_LIMITS.videoFormats.join(", ")}). Max ${MEDIA_LIMITS.maxSizeMb} MB per file.`;
};

export const HOW_TO_PUBLISH =
  "After you edit, click Save draft. When ready for the live website, click Save & publish (or go to Publish). Visitors only see published changes.";
