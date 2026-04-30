import "server-only";

import { createHash } from "node:crypto";
import {
  MEDIA_ALLOWED_IMAGE_FORMATS,
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_UPLOAD_BYTES,
  DEFAULT_MEDIA_UPLOAD_FOLDER,
  buildMediaUploadFolder,
  type MediaUploadUsage
} from "@/lib/media/media-config";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadFolder: string;
};

function readEnv(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildCloudinarySignaturePayload(params: Record<string, string>) {
  return Object.entries(params)
    .filter(([, value]) => value.trim().length > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = readEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = readEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = readEnv(process.env.CLOUDINARY_API_SECRET);
  const uploadFolder = readEnv(process.env.CLOUDINARY_UPLOAD_FOLDER) || DEFAULT_MEDIA_UPLOAD_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadFolder
  };
}

export function isCloudinaryConfigured() {
  return Boolean(getCloudinaryConfig());
}

export function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = buildCloudinarySignaturePayload(params);
  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function createCloudinarySignedUploadInput(params: {
  usage: MediaUploadUsage;
  userId: string;
}) {
  const config = getCloudinaryConfig();

  if (!config) {
    throw new Error("cloudinary-not-configured");
  }

  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const folder = buildMediaUploadFolder(config.uploadFolder, params.usage);
  const tags = ["fumgpt", "admin-upload", `usage-${params.usage}`].join(",");
  const context = `source=admin|usage=${params.usage}|uploaded_by=${params.userId}`;
  const signature = signCloudinaryParams(
    {
      context,
      folder,
      tags,
      timestamp
    },
    config.apiSecret
  );

  return {
    usage: params.usage,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    fields: {
      api_key: config.apiKey,
      timestamp,
      signature,
      folder,
      tags,
      context
    },
    constraints: {
      maxBytes: MEDIA_MAX_UPLOAD_BYTES,
      allowedMimeTypes: [...MEDIA_ALLOWED_IMAGE_MIME_TYPES]
    }
  };
}

export function isCloudinaryDeliveryUrl(value: string, cloudName: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/image/upload/`)
    );
  } catch {
    return false;
  }
}

export function isAllowedCloudinaryImageFormat(value: string) {
  const normalized = value.trim().toLowerCase();
  return MEDIA_ALLOWED_IMAGE_FORMATS.some((format) => format === normalized);
}

