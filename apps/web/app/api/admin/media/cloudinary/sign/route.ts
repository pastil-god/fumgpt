import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createCloudinarySignedUploadInput,
  getCloudinaryConfig
} from "@/lib/media/cloudinary";
import {
  normalizeMediaUploadUsage,
  type MediaUploadUsage
} from "@/lib/media/media-config";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

type SignPayload = {
  usage?: unknown;
};

export const runtime = "nodejs";

function jsonWithContext(requestContext: ReturnType<typeof createRequestContext>, body: unknown, init?: ResponseInit) {
  return attachRequestContext(NextResponse.json(body, init), requestContext);
}

function resolveUsage(payload: SignPayload): MediaUploadUsage | null {
  if (typeof payload.usage === "undefined") {
    return "general";
  }

  return normalizeMediaUploadUsage(payload.usage);
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/admin/media/cloudinary/sign");
  const session = await getSession();

  if (!session) {
    return jsonWithContext(requestContext, { error: "unauthorized" }, { status: 401 });
  }

  if (session.role !== "super_admin") {
    await recordAuditEvent({
      action: "admin.media_upload_signature_denied",
      entityType: "media_asset",
      userId: session.userId,
      requestContext,
      level: "warn",
      details: {
        role: session.role
      },
      message: "Non-super-admin attempted media upload signature request"
    });

    return jsonWithContext(requestContext, { error: "forbidden" }, { status: 403 });
  }

  if (!getCloudinaryConfig()) {
    return jsonWithContext(requestContext, { error: "media-not-configured" }, { status: 503 });
  }

  let payload: SignPayload = {};

  try {
    payload = (await request.json()) as SignPayload;
  } catch {
    payload = {};
  }

  const usage = resolveUsage(payload);

  if (!usage) {
    return jsonWithContext(requestContext, { error: "invalid-usage" }, { status: 400 });
  }

  const signedInput = createCloudinarySignedUploadInput({
    usage,
    userId: session.userId
  });

  await recordAuditEvent({
    action: "admin.media_upload_signature_issued",
    entityType: "media_asset",
    userId: session.userId,
    requestContext,
    details: {
      usage,
      folder: signedInput.fields.folder,
      source: "admin-settings"
    },
    message: "Super admin requested signed media upload"
  });

  return jsonWithContext(requestContext, {
    ok: true,
    ...signedInput
  });
}

