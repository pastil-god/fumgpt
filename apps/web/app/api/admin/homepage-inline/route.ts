import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";
import {
  HOMEPAGE_SETTINGS_ID,
  SITE_SETTINGS_ID,
  saveInlineHomepageSettings,
  saveInlineSiteAppearanceSettings
} from "@/lib/settings/admin-settings";
import {
  INLINE_HOMEPAGE_HREF_FIELDS,
  INLINE_HOMEPAGE_TEXT_FIELDS,
  INLINE_HOMEPAGE_VISIBILITY_FIELDS,
  getInlineFontFamilyFallback,
  isHexColor,
  isSafeInlineFontFamily,
  isSafeInlineHref,
  normalizeHomepageFieldStyles,
  type HomepageFieldStyles,
  type InlineHomepageValues,
  type InlineThemeValues
} from "@/lib/settings/inline-homepage";

type InlineSavePayload = {
  homepage?: Partial<Record<string, unknown>>;
  theme?: Partial<Record<string, unknown>>;
  fieldStyles?: unknown;
};

function jsonWithContext(requestContext: ReturnType<typeof createRequestContext>, body: unknown, init?: ResponseInit) {
  return attachRequestContext(NextResponse.json(body, init), requestContext);
}

function readString(source: Partial<Record<string, unknown>>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHomepagePayload(source: Partial<Record<string, unknown>> | undefined) {
  if (!source) {
    return null;
  }

  const values = {} as InlineHomepageValues;

  for (const field of INLINE_HOMEPAGE_TEXT_FIELDS) {
    values[field] = readString(source, field);
  }

  for (const field of INLINE_HOMEPAGE_VISIBILITY_FIELDS) {
    const value = source[field];

    if (typeof value !== "boolean") {
      return null;
    }

    values[field] = value;
  }

  for (const field of INLINE_HOMEPAGE_HREF_FIELDS) {
    if (!isSafeInlineHref(values[field])) {
      return null;
    }
  }

  return values;
}

function normalizeThemePayload(source: Partial<Record<string, unknown>> | undefined) {
  if (!source) {
    return null;
  }

  const primaryColor = readString(source, "primaryColor");
  const secondaryColor = readString(source, "secondaryColor");
  const fontFamily = readString(source, "fontFamily");

  if (!isHexColor(primaryColor) || !isHexColor(secondaryColor) || !isSafeInlineFontFamily(fontFamily)) {
    return null;
  }

  return {
    primaryColor,
    secondaryColor,
    fontFamily: getInlineFontFamilyFallback(fontFamily)
  } satisfies InlineThemeValues;
}

function normalizeFieldStylesPayload(source: unknown): HomepageFieldStyles | null {
  return normalizeHomepageFieldStyles(source);
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/admin/homepage-inline");
  const session = await getSession();

  if (!session) {
    return jsonWithContext(requestContext, { error: "unauthorized" }, { status: 401 });
  }

  if (session.role !== "super_admin") {
    await recordAuditEvent({
      action: "admin.homepage_inline_update_denied",
      entityType: "homepage_settings",
      entityId: HOMEPAGE_SETTINGS_ID,
      userId: session.userId,
      requestContext,
      level: "warn",
      details: {
        role: session.role
      },
      message: "Non-super-admin attempted homepage inline update"
    });

    return jsonWithContext(requestContext, { error: "forbidden" }, { status: 403 });
  }

  let payload: InlineSavePayload;

  try {
    payload = (await request.json()) as InlineSavePayload;
  } catch {
    return jsonWithContext(requestContext, { error: "invalid-json" }, { status: 400 });
  }

  const homepage = normalizeHomepagePayload(payload.homepage);
  const theme = normalizeThemePayload(payload.theme);
  const fieldStyles = normalizeFieldStylesPayload(payload.fieldStyles);

  if (!homepage || !theme || !fieldStyles) {
    return jsonWithContext(requestContext, { error: "invalid-payload" }, { status: 400 });
  }

  await saveInlineHomepageSettings(homepage, session.userId, fieldStyles);
  await saveInlineSiteAppearanceSettings(theme, session.userId);

  await recordAuditEvent({
    action: "admin.homepage_inline_updated",
    entityType: "homepage_settings",
    entityId: HOMEPAGE_SETTINGS_ID,
    userId: session.userId,
    requestContext,
    details: {
      fields: [...INLINE_HOMEPAGE_TEXT_FIELDS, ...INLINE_HOMEPAGE_VISIBILITY_FIELDS],
      styledFields: Object.keys(fieldStyles),
      source: "homepage-inline-editor"
    },
    message: "Super admin updated homepage through inline editor"
  });

  await recordAuditEvent({
    action: "admin.homepage_inline_styles_updated",
    entityType: "homepage_settings",
    entityId: HOMEPAGE_SETTINGS_ID,
    userId: session.userId,
    requestContext,
    details: {
      styledFields: Object.keys(fieldStyles),
      source: "homepage-inline-editor"
    },
    message: "Super admin updated homepage inline text styles"
  });

  await recordAuditEvent({
    action: "admin.site_theme_inline_updated",
    entityType: "site_settings",
    entityId: SITE_SETTINGS_ID,
    userId: session.userId,
    requestContext,
    details: {
      fields: ["primaryColor", "secondaryColor", "fontFamily"],
      source: "homepage-inline-editor"
    },
    message: "Super admin updated site theme through inline editor"
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/settings");

  return jsonWithContext(requestContext, { ok: true });
}
