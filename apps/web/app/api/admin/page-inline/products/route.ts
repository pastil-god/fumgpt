import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";
import {
  PAGE_SETTINGS_PRODUCTS_SLUG,
  saveProductsPageInlineSettings
} from "@/lib/settings/admin-settings";
import {
  INLINE_PRODUCTS_PAGE_FIELDS,
  normalizeInlineProductsPageFieldStyles,
  validateInlineProductsPageValues
} from "@/lib/settings/inline-products";

type ProductsInlineSavePayload = {
  content?: unknown;
  fieldStyles?: unknown;
};

function jsonWithContext(requestContext: ReturnType<typeof createRequestContext>, body: unknown, init?: ResponseInit) {
  return attachRequestContext(NextResponse.json(body, init), requestContext);
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/admin/page-inline/products");
  const session = await getSession();

  if (!session) {
    return jsonWithContext(requestContext, { error: "unauthorized" }, { status: 401 });
  }

  if (session.role !== "super_admin") {
    await recordAuditEvent({
      action: "admin.products_page_inline_update_denied",
      entityType: "page_settings",
      entityId: PAGE_SETTINGS_PRODUCTS_SLUG,
      userId: session.userId,
      requestContext,
      level: "warn",
      details: {
        role: session.role,
        slug: PAGE_SETTINGS_PRODUCTS_SLUG
      },
      message: "Non-super-admin attempted products page inline update"
    });

    return jsonWithContext(requestContext, { error: "forbidden" }, { status: 403 });
  }

  let payload: ProductsInlineSavePayload;

  try {
    payload = (await request.json()) as ProductsInlineSavePayload;
  } catch {
    return jsonWithContext(requestContext, { error: "invalid-json" }, { status: 400 });
  }

  const content = validateInlineProductsPageValues(payload.content);
  const fieldStyles = normalizeInlineProductsPageFieldStyles(payload.fieldStyles);

  if (!content || !fieldStyles) {
    return jsonWithContext(requestContext, { error: "invalid-payload" }, { status: 400 });
  }

  await saveProductsPageInlineSettings(content, session.userId, fieldStyles);

  await recordAuditEvent({
    action: "admin.products_page_inline_updated",
    entityType: "page_settings",
    entityId: PAGE_SETTINGS_PRODUCTS_SLUG,
    userId: session.userId,
    requestContext,
    details: {
      slug: PAGE_SETTINGS_PRODUCTS_SLUG,
      fields: [...INLINE_PRODUCTS_PAGE_FIELDS],
      styledFields: Object.keys(fieldStyles),
      source: "products-inline-editor"
    },
    message: "Super admin updated products page through inline editor"
  });

  revalidatePath("/products");
  revalidatePath("/admin");

  return jsonWithContext(requestContext, { ok: true });
}
