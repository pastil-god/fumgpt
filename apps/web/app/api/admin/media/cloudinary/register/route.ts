import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getCloudinaryConfig,
  isAllowedCloudinaryImageFormat,
  isCloudinaryDeliveryUrl
} from "@/lib/media/cloudinary";
import {
  MEDIA_MAX_UPLOAD_BYTES,
  buildMediaUploadFolder,
  normalizeMediaUploadUsage
} from "@/lib/media/media-config";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

type RegisterPayload = {
  usage?: unknown;
  secureUrl?: unknown;
  publicId?: unknown;
  bytes?: unknown;
  width?: unknown;
  height?: unknown;
  format?: unknown;
  resourceType?: unknown;
  originalFilename?: unknown;
};

export const runtime = "nodejs";

function jsonWithContext(requestContext: ReturnType<typeof createRequestContext>, body: unknown, init?: ResponseInit) {
  return attachRequestContext(NextResponse.json(body, init), requestContext);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/admin/media/cloudinary/register");
  const session = await getSession();

  if (!session) {
    return jsonWithContext(requestContext, { error: "unauthorized" }, { status: 401 });
  }

  if (session.role !== "super_admin") {
    await recordAuditEvent({
      action: "admin.media_upload_register_denied",
      entityType: "media_asset",
      userId: session.userId,
      requestContext,
      level: "warn",
      details: {
        role: session.role
      },
      message: "Non-super-admin attempted media upload register"
    });
    return jsonWithContext(requestContext, { error: "forbidden" }, { status: 403 });
  }

  const cloudinaryConfig = getCloudinaryConfig();

  if (!cloudinaryConfig) {
    return jsonWithContext(requestContext, { error: "media-not-configured" }, { status: 503 });
  }

  let payload: RegisterPayload;

  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return jsonWithContext(requestContext, { error: "invalid-json" }, { status: 400 });
  }

  const usage = normalizeMediaUploadUsage(payload.usage);
  const secureUrl = readString(payload.secureUrl);
  const publicId = readString(payload.publicId);
  const format = readString(payload.format).toLowerCase();
  const resourceType = readString(payload.resourceType);
  const originalFilename = readString(payload.originalFilename);
  const bytes = readNumber(payload.bytes);
  const width = readNumber(payload.width);
  const height = readNumber(payload.height);

  if (!usage || !secureUrl || !publicId || !format || !resourceType || !bytes) {
    return jsonWithContext(requestContext, { error: "invalid-payload" }, { status: 400 });
  }

  if (
    resourceType !== "image" ||
    !isCloudinaryDeliveryUrl(secureUrl, cloudinaryConfig.cloudName) ||
    !isAllowedCloudinaryImageFormat(format) ||
    bytes <= 0 ||
    bytes > MEDIA_MAX_UPLOAD_BYTES
  ) {
    return jsonWithContext(requestContext, { error: "invalid-asset" }, { status: 400 });
  }

  const expectedFolderPrefix = `${buildMediaUploadFolder(cloudinaryConfig.uploadFolder, usage)}/`;

  if (!publicId.startsWith(expectedFolderPrefix)) {
    return jsonWithContext(requestContext, { error: "invalid-folder" }, { status: 400 });
  }

  await recordAuditEvent({
    action: "admin.media_upload_registered",
    entityType: "media_asset",
    entityId: publicId,
    userId: session.userId,
    requestContext,
    details: {
      usage,
      secureUrl,
      bytes,
      width,
      height,
      format,
      originalFilename
    },
    message: "Super admin uploaded a media asset"
  });

  return jsonWithContext(requestContext, {
    ok: true,
    asset: {
      usage,
      url: secureUrl,
      publicId,
      bytes,
      width,
      height,
      format,
      originalFilename
    }
  });
}

