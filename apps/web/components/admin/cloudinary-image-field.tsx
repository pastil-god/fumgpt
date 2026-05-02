"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import {
  MEDIA_ALLOWED_IMAGE_MIME_TYPES,
  MEDIA_MAX_UPLOAD_BYTES,
  type MediaUploadUsage
} from "@/lib/media/media-config";

type CloudinarySignResponse = {
  uploadUrl: string;
  fields: Record<string, string>;
  constraints?: {
    maxBytes?: number;
    allowedMimeTypes?: string[];
  };
};

type CloudinaryRegisterResponse = {
  asset: {
    url: string;
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    if (typeof source.error === "string" && source.error.trim()) {
      return source.error;
    }
    if (source.error && typeof source.error === "object") {
      const cloudinaryError = source.error as Record<string, unknown>;
      if (typeof cloudinaryError.message === "string" && cloudinaryError.message.trim()) {
        return cloudinaryError.message;
      }
    }
  }
  return fallback;
}

async function readJsonSafe(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export function CloudinaryImageField({
  name,
  label,
  defaultValue,
  value: controlledValue,
  onChange,
  placeholder,
  usage,
  className,
  previewAlt,
  helperText
}: {
  name: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  usage: MediaUploadUsage;
  className?: string;
  previewAlt?: string;
  helperText?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
  const [helperMessage, setHelperMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const acceptedTypes = MEDIA_ALLOWED_IMAGE_MIME_TYPES.join(",");
  const isControlled = typeof controlledValue === "string";
  const value = isControlled ? controlledValue : uncontrolledValue;

  function updateValue(nextValue: string) {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function handleManualValueChange(event: ChangeEvent<HTMLInputElement>) {
    updateValue(event.target.value);
    setHelperMessage(null);
    setErrorMessage(null);
  }

  function resetFileInput(event: ChangeEvent<HTMLInputElement>) {
    event.target.value = "";
  }

  function validateLocalFile(file: File) {
    if (!MEDIA_ALLOWED_IMAGE_MIME_TYPES.some((allowedType) => allowedType === file.type)) {
      return "فرمت فایل معتبر نیست. فقط JPG، PNG، WEBP یا AVIF مجاز است.";
    }

    if (file.size <= 0 || file.size > MEDIA_MAX_UPLOAD_BYTES) {
      return `حجم فایل باید کمتر از ${formatBytes(MEDIA_MAX_UPLOAD_BYTES)} باشد.`;
    }

    return null;
  }

  async function uploadToCloudinary(file: File) {
    const signResponse = await fetch("/api/admin/media/cloudinary/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usage })
    });
    const signPayload = await readJsonSafe(signResponse);

    if (!signResponse.ok || !signPayload || typeof signPayload !== "object") {
      throw new Error(readErrorMessage(signPayload, "گرفتن امضای آپلود انجام نشد."));
    }

    const signedInput = signPayload as CloudinarySignResponse;

    if (
      typeof signedInput.uploadUrl !== "string" ||
      !signedInput.fields ||
      typeof signedInput.fields !== "object"
    ) {
      throw new Error("پاسخ امضای آپلود معتبر نبود.");
    }

    const allowedMimeTypes = Array.isArray(signedInput.constraints?.allowedMimeTypes)
      ? signedInput.constraints.allowedMimeTypes.filter((item): item is string => typeof item === "string")
      : [...MEDIA_ALLOWED_IMAGE_MIME_TYPES];
    const maxBytes =
      typeof signedInput.constraints?.maxBytes === "number" && Number.isFinite(signedInput.constraints.maxBytes)
        ? signedInput.constraints.maxBytes
        : MEDIA_MAX_UPLOAD_BYTES;

    if (allowedMimeTypes.length === 0 || maxBytes <= 0) {
      throw new Error("تنظیمات امنیتی آپلود سمت سرور معتبر نیست.");
    }

    const uploadFields: Record<string, string> = {};
    for (const [key, fieldValue] of Object.entries(signedInput.fields)) {
      if (typeof fieldValue === "string" && fieldValue.trim().length > 0) {
        uploadFields[key] = fieldValue;
      }
    }

    if (Object.keys(uploadFields).length === 0) {
      throw new Error("پارامترهای آپلود معتبر نبود.");
    }

    if (!allowedMimeTypes.some((allowedType) => allowedType === file.type)) {
      throw new Error("نوع فایل با سیاست آپلود سمت سرور سازگار نیست.");
    }

    if (file.size > maxBytes) {
      throw new Error(`حداکثر حجم مجاز ${formatBytes(maxBytes)} است.`);
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    for (const [key, fieldValue] of Object.entries(uploadFields)) {
      uploadFormData.append(key, fieldValue);
    }

    const uploadResponse = await fetch(signedInput.uploadUrl, {
      method: "POST",
      body: uploadFormData
    });
    const uploadPayload = await readJsonSafe(uploadResponse);

    if (!uploadResponse.ok || !uploadPayload || typeof uploadPayload !== "object") {
      throw new Error(readErrorMessage(uploadPayload, "آپلود تصویر انجام نشد."));
    }

    const uploadedAsset = uploadPayload as Record<string, unknown>;
    const registerResponse = await fetch("/api/admin/media/cloudinary/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usage,
        secureUrl: uploadedAsset.secure_url,
        publicId: uploadedAsset.public_id,
        bytes: uploadedAsset.bytes,
        width: uploadedAsset.width,
        height: uploadedAsset.height,
        format: uploadedAsset.format,
        resourceType: uploadedAsset.resource_type,
        originalFilename: uploadedAsset.original_filename
      })
    });
    const registerPayload = await readJsonSafe(registerResponse);

    if (!registerResponse.ok || !registerPayload || typeof registerPayload !== "object") {
      throw new Error(readErrorMessage(registerPayload, "ثبت تصویر آپلودشده انجام نشد."));
    }

    const normalizedAsset = registerPayload as CloudinaryRegisterResponse;
    if (!normalizedAsset.asset || typeof normalizedAsset.asset.url !== "string") {
      throw new Error("پاسخ ثبت تصویر معتبر نبود.");
    }

    updateValue(normalizedAsset.asset.url);
    setErrorMessage(null);
    setHelperMessage("تصویر آپلود شد. برای اعمال نهایی، فرم را ذخیره کن.");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateLocalFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      setHelperMessage(null);
      resetFileInput(event);
      return;
    }

    setErrorMessage(null);
    setHelperMessage("در حال آپلود...");
    startTransition(() => {
      void uploadToCloudinary(file)
        .catch((error: unknown) => {
          const message = error instanceof Error && error.message ? error.message : "آپلود تصویر ناموفق بود.";
          setErrorMessage(message);
          setHelperMessage(null);
        })
        .finally(() => {
          resetFileInput(event);
        });
    });
  }

  return (
    <label className={`checkout-field admin-settings-field admin-media-field${className ? ` ${className}` : ""}`}>
      <span>{label}</span>
      <input
        name={name}
        type="text"
        inputMode="url"
        value={value}
        onChange={handleManualValueChange}
        placeholder={placeholder}
      />

      <div className="admin-media-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          {isPending ? "در حال آپلود..." : "آپلود تصویر"}
        </button>
        {value ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              updateValue("");
              setErrorMessage(null);
              setHelperMessage("آدرس تصویر پاک شد. برای اعمال، فرم را ذخیره کن.");
            }}
            disabled={isPending}
          >
            پاک‌کردن
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        className="admin-media-picker"
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
      />

      <small className="admin-media-note">
        فقط تصویر، حداکثر {formatBytes(MEDIA_MAX_UPLOAD_BYTES)}. این مسیر فقط برای super_admin فعال است.
      </small>
      {helperMessage ? <small className="admin-media-helper">{helperMessage}</small> : null}
      {errorMessage ? <small className="admin-media-helper is-error">{errorMessage}</small> : null}

      {value ? (
        <div className="admin-media-preview">
          <img src={value} alt={previewAlt || label} loading="lazy" />
        </div>
      ) : null}
    </label>
  );
}

