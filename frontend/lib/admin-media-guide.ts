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
  "After you edit, click Save & publish. The live website updates — no separate publish step.";

const VIDEO_EXT_RE = /\.(mp4|webm|mov|ogg|m4v)(\?|#|$)/i;

export const isVideoUrl = (url: string | null | undefined): boolean =>
  Boolean(url && VIDEO_EXT_RE.test(url));

export const isVideoMime = (mime: string | null | undefined): boolean =>
  Boolean(mime && mime.toLowerCase().startsWith("video/"));

export const detectMediaKind = (input: {
  url?: string | null;
  mime?: string | null;
  kind?: "image" | "video" | null;
  fileName?: string | null;
  fileType?: string | null;
}): "image" | "video" => {
  if (input.kind === "video") return "video";
  if (isVideoMime(input.mime) || isVideoMime(input.fileType)) return "video";
  if (isVideoUrl(input.url) || isVideoUrl(input.fileName)) return "video";
  return "image";
};
