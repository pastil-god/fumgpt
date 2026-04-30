export const MEDIA_UPLOAD_USAGES = ["general", "logo", "favicon", "homepage", "banner", "product"] as const;

export type MediaUploadUsage = (typeof MEDIA_UPLOAD_USAGES)[number];

export const MEDIA_ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
] as const;

export const MEDIA_ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export const MEDIA_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const DEFAULT_MEDIA_UPLOAD_FOLDER = "fumgpt/admin";

export function normalizeMediaUploadUsage(value: unknown): MediaUploadUsage | null {
  return typeof value === "string" && MEDIA_UPLOAD_USAGES.some((usage) => usage === value)
    ? (value as MediaUploadUsage)
    : null;
}

function normalizeFolderSegment(value: string) {
  return value
    .trim()
    .replace(/[^\w/-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

export function buildMediaUploadFolder(baseFolder: string, usage: MediaUploadUsage) {
  const safeBase = normalizeFolderSegment(baseFolder) || DEFAULT_MEDIA_UPLOAD_FOLDER;
  return `${safeBase}/${usage}`;
}

