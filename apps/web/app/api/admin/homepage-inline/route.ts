import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordAuditEvent } from "@/lib/observability/audit";
import { logServerEvent } from "@/lib/observability/logger";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";
import {
  getStoredSiteSettings,
  HOMEPAGE_SETTINGS_ID,
  SITE_SETTINGS_ID,
  getStoredHomepageSettings,
  saveInlineHomepageSettings,
  saveInlineSiteAppearanceSettings
} from "@/lib/settings/admin-settings";
import { fallbackStorefrontSettings } from "@/lib/site";
import {
  INLINE_HOMEPAGE_HREF_FIELDS,
  INLINE_HOMEPAGE_IMAGE_FIELDS,
  INLINE_HOMEPAGE_TEXT_FIELDS,
  INLINE_HOMEPAGE_VISIBILITY_FIELDS,
  HOMEPAGE_CUSTOM_BLOCK_ALIGNS,
  HOMEPAGE_CUSTOM_BLOCK_MAX_COUNT,
  HOMEPAGE_CUSTOM_BLOCK_PLACEMENTS,
  HOMEPAGE_CUSTOM_BLOCK_WIDTHS,
  INLINE_THEME_BUTTON_RADIUS_OPTIONS,
  INLINE_THEME_BUTTON_STYLE_OPTIONS,
  INLINE_THEME_CARD_RADIUS_OPTIONS,
  INLINE_THEME_CARD_SHADOW_OPTIONS,
  INLINE_THEME_DENSITY_OPTIONS,
  INLINE_THEME_FIELD_KEYS,
  isHexColor,
  isSafeHomepageFontKey,
  isSafeHomepageFontWeight,
  isSafeInlineImageUrl,
  isSafeInlineHref,
  isSafeHomepageCustomBlockId,
  normalizeInlineThemeValues,
  normalizeHomepageCustomBlocks,
  normalizeHomepageLayoutSettings,
  type HomepageCustomBlock,
  type HomepageCustomBlockAlign,
  type HomepageCustomBlockPlacement,
  type HomepageCustomBlockWidth,
  type HomepageFieldStyle,
  type HomepageFieldStyles,
  type HomepageLayoutSettings,
  type InlineHomepageValues,
  type InlineThemeValues
} from "@/lib/settings/inline-homepage";

type InlineSavePayload = {
  homepage?: Partial<Record<string, unknown>>;
  theme?: Partial<Record<string, unknown>>;
  fieldStyles?: unknown;
  customBlocks?: unknown;
  layoutSettings?: unknown;
};

type ValidationIssue = {
  path: string;
  code: string;
  message: string;
};

type ValidationResult<TValue> =
  | {
      ok: true;
      value: TValue;
      issues: [];
    }
  | {
      ok: false;
      value: null;
      issues: ValidationIssue[];
    };

const HOMEPAGE_HREF_FIELD_LABELS: Partial<Record<(typeof INLINE_HOMEPAGE_HREF_FIELDS)[number], string>> = {
  heroPrimaryCtaHref: "لینک دکمه اصلی",
  heroSecondaryCtaHref: "لینک دکمه دوم",
  categoriesCtaHref: "لینک دکمه دسته‌بندی‌ها",
  featuredCtaHref: "لینک دکمه محصولات منتخب",
  newsCtaHref: "لینک دکمه اخبار",
  announcementCtaHref: "لینک دکمه نوار پایانی"
};

const THEME_FIELD_LABELS: Partial<Record<keyof InlineThemeValues, string>> = {
  primaryColor: "رنگ اصلی",
  secondaryColor: "رنگ مکمل",
  backgroundTint: "ته‌رنگ پس‌زمینه",
  fontFamily: "فونت اصلی",
  headingFontFamily: "فونت تیترها"
};

function invalid<TValue>(issues: ValidationIssue[]): ValidationResult<TValue> {
  return { ok: false, value: null, issues };
}

function valid<TValue>(value: TValue): ValidationResult<TValue> {
  return { ok: true, value, issues: [] };
}

function jsonWithContext(requestContext: ReturnType<typeof createRequestContext>, body: unknown, init?: ResponseInit) {
  return attachRequestContext(NextResponse.json(body, init), requestContext);
}

function readString(source: Partial<Record<string, unknown>>, key: string, issues: ValidationIssue[]) {
  const value = source[key];

  if (typeof value === "string") {
    return value.trim();
  }

  if (value == null) {
    return "";
  }

  issues.push({
    path: `homepage.${key}`,
    code: "invalid_type",
    message: "متن واردشده معتبر نیست."
  });
  return "";
}

function readOptionalString(source: Partial<Record<string, unknown>>, key: string, issues: ValidationIssue[]) {
  const value = source[key];

  if (typeof value === "string") {
    return value.trim();
  }

  if (value == null) {
    return "";
  }

  issues.push({
    path: `homepage.${key}`,
    code: "invalid_type",
    message: "مقدار این فیلد باید متن باشد."
  });
  return "";
}

function normalizeHex(value: string) {
  const text = value.trim();

  if (text.length === 4) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`.toLowerCase();
  }

  return text.toLowerCase();
}

function normalizeHomepagePayload(
  source: Partial<Record<string, unknown>> | undefined
): ValidationResult<InlineHomepageValues> {
  if (!source) {
    return invalid([
      {
        path: "homepage",
        code: "required",
        message: "محتوای صفحه برای ذخیره ارسال نشده است."
      }
    ]);
  }

  const issues: ValidationIssue[] = [];
  const allowedFields = new Set<string>([
    ...INLINE_HOMEPAGE_TEXT_FIELDS,
    ...INLINE_HOMEPAGE_VISIBILITY_FIELDS,
    ...INLINE_HOMEPAGE_IMAGE_FIELDS
  ]);

  for (const field of Object.keys(source)) {
    if (!allowedFields.has(field)) {
      issues.push({
        path: `homepage.${field}`,
        code: "unknown_field",
        message: "این فیلد برای ویرایش صفحه مجاز نیست."
      });
    }
  }

  const values = {} as InlineHomepageValues;
  const hrefFields = new Set<string>(INLINE_HOMEPAGE_HREF_FIELDS);

  for (const field of INLINE_HOMEPAGE_TEXT_FIELDS) {
    values[field] = hrefFields.has(field) ? readOptionalString(source, field, issues) : readString(source, field, issues);
  }

  for (const field of INLINE_HOMEPAGE_IMAGE_FIELDS) {
    const value = readOptionalString(source, field, issues);

    if (value && !isSafeInlineImageUrl(value)) {
      issues.push({
        path: `homepage.${field}`,
        code: "unsafe_image_url",
        message: "آدرس تصویر معتبر نیست یا از دامنه مجاز انتخاب نشده است."
      });
    }

    values[field] = value;
  }

  for (const field of INLINE_HOMEPAGE_VISIBILITY_FIELDS) {
    const value = source[field];

    if (typeof value !== "boolean") {
      issues.push({
        path: `homepage.${field}`,
        code: "invalid_type",
        message: "وضعیت نمایش این بخش معتبر نیست."
      });
      values[field] = true;
      continue;
    }

    values[field] = value;
  }

  for (const field of INLINE_HOMEPAGE_HREF_FIELDS) {
    const value = values[field].trim();

    if (value && !isSafeInlineHref(value)) {
      issues.push({
        path: `homepage.${field}`,
        code: "unsafe_url",
        message: `${HOMEPAGE_HREF_FIELD_LABELS[field] || "لینک"} معتبر نیست.`
      });
    }
  }

  return issues.length > 0 ? invalid(issues) : valid(values);
}

function hasOptionValue<TOption extends { value: string }>(options: ReadonlyArray<TOption>, value: string) {
  return options.some((option) => option.value === value);
}

function normalizeThemeColor(
  source: Partial<Record<string, unknown>>,
  field: "primaryColor" | "secondaryColor" | "backgroundTint",
  fallback: InlineThemeValues,
  issues: ValidationIssue[]
) {
  const value = source[field];

  if (value == null || value === "") {
    return fallback[field];
  }

  if (typeof value !== "string") {
    issues.push({
      path: `theme.${field}`,
      code: "invalid_type",
      message: `${THEME_FIELD_LABELS[field]} باید کد رنگ معتبر باشد.`
    });
    return fallback[field];
  }

  const text = value.trim();

  if (!text) {
    return fallback[field];
  }

  if (!isHexColor(text)) {
    issues.push({
      path: `theme.${field}`,
      code: "invalid_color",
      message: "رنگ انتخاب‌شده باید مثل #1a73e8 باشد."
    });
    return fallback[field];
  }

  return normalizeHex(text);
}

function normalizeThemeFont(
  source: Partial<Record<string, unknown>>,
  field: "fontFamily" | "headingFontFamily",
  fallback: InlineThemeValues,
  issues: ValidationIssue[]
) {
  const value = source[field];

  if (value == null || value === "") {
    return fallback[field];
  }

  if (typeof value !== "string") {
    issues.push({
      path: `theme.${field}`,
      code: "invalid_type",
      message: `${THEME_FIELD_LABELS[field]} معتبر نیست.`
    });
    return fallback[field];
  }

  const text = value.trim();

  if (!text) {
    return fallback[field];
  }

  if (!isSafeHomepageFontKey(text)) {
    issues.push({
      path: `theme.${field}`,
      code: "invalid_font",
      message: "فونت انتخاب‌شده معتبر نیست."
    });
    return fallback[field];
  }

  return text;
}

function normalizeThemeOption<TValue extends string>(
  source: Partial<Record<string, unknown>>,
  field: keyof InlineThemeValues,
  fallbackValue: TValue,
  options: ReadonlyArray<{ value: TValue }>,
  issues: ValidationIssue[]
) {
  const value = source[field];

  if (value == null || value === "") {
    return fallbackValue;
  }

  if (typeof value !== "string" || !hasOptionValue(options, value)) {
    issues.push({
      path: `theme.${String(field)}`,
      code: "invalid_option",
      message: "گزینه ظاهری انتخاب‌شده معتبر نیست."
    });
    return fallbackValue;
  }

  return value as TValue;
}

function normalizeThemePayload(
  source: Partial<Record<string, unknown>> | undefined,
  fallback: InlineThemeValues
): ValidationResult<InlineThemeValues> {
  if (!source) {
    return invalid([
      {
        path: "theme",
        code: "required",
        message: "تنظیمات ظاهر صفحه برای ذخیره ارسال نشده است."
      }
    ]);
  }

  const issues: ValidationIssue[] = [];
  const allowedKeys = new Set<string>(INLINE_THEME_FIELD_KEYS);

  for (const key of Object.keys(source)) {
    if (!allowedKeys.has(key)) {
      issues.push({
        path: `theme.${key}`,
        code: "unknown_field",
        message: "این تنظیم ظاهر مجاز نیست."
      });
    }
  }

  const theme: InlineThemeValues = {
    primaryColor: normalizeThemeColor(source, "primaryColor", fallback, issues),
    secondaryColor: normalizeThemeColor(source, "secondaryColor", fallback, issues),
    backgroundTint: normalizeThemeColor(source, "backgroundTint", fallback, issues),
    fontFamily: normalizeThemeFont(source, "fontFamily", fallback, issues),
    headingFontFamily: normalizeThemeFont(source, "headingFontFamily", fallback, issues),
    buttonRadius: normalizeThemeOption(source, "buttonRadius", fallback.buttonRadius, INLINE_THEME_BUTTON_RADIUS_OPTIONS, issues),
    cardRadius: normalizeThemeOption(source, "cardRadius", fallback.cardRadius, INLINE_THEME_CARD_RADIUS_OPTIONS, issues),
    cardShadow: normalizeThemeOption(source, "cardShadow", fallback.cardShadow, INLINE_THEME_CARD_SHADOW_OPTIONS, issues),
    sectionDensity: normalizeThemeOption(source, "sectionDensity", fallback.sectionDensity, INLINE_THEME_DENSITY_OPTIONS, issues),
    buttonStyle: normalizeThemeOption(source, "buttonStyle", fallback.buttonStyle, INLINE_THEME_BUTTON_STYLE_OPTIONS, issues)
  };

  return issues.length > 0 ? invalid(issues) : valid(theme);
}

function normalizeFieldStylesPayload(source: unknown): ValidationResult<HomepageFieldStyles> {
  if (source == null) {
    return valid({});
  }

  if (typeof source !== "object" || Array.isArray(source)) {
    return invalid([
      {
        path: "fieldStyles",
        code: "invalid_type",
        message: "استایل‌های متن معتبر نیستند."
      }
    ]);
  }

  const root = source as Record<string, unknown>;
  const styleSource = "fields" in root ? root.fields : source;

  if (styleSource == null) {
    return valid({});
  }

  if (typeof styleSource !== "object" || Array.isArray(styleSource)) {
    return invalid([
      {
        path: "fieldStyles.fields",
        code: "invalid_type",
        message: "استایل‌های متن معتبر نیستند."
      }
    ]);
  }

  const sourceStyles = styleSource as Record<string, unknown>;
  const issues: ValidationIssue[] = [];
  const allowedFields = new Set<string>(INLINE_HOMEPAGE_TEXT_FIELDS);
  const result: HomepageFieldStyles = {};

  for (const [field, rawStyle] of Object.entries(sourceStyles)) {
    if (!allowedFields.has(field)) {
      issues.push({
        path: `fieldStyles.${field}`,
        code: "unknown_field",
        message: "این فیلد برای استایل‌دهی مجاز نیست."
      });
      continue;
    }

    if (rawStyle == null) {
      continue;
    }

    if (typeof rawStyle !== "object" || Array.isArray(rawStyle)) {
      issues.push({
        path: `fieldStyles.${field}`,
        code: "invalid_type",
        message: "استایل متن معتبر نیست."
      });
      continue;
    }

    const style = rawStyle as Record<string, unknown>;
    const allowedStyleKeys = new Set(["fontKey", "color", "fontWeight"]);

    for (const styleKey of Object.keys(style)) {
      if (!allowedStyleKeys.has(styleKey)) {
        issues.push({
          path: `fieldStyles.${field}.${styleKey}`,
          code: "unknown_field",
          message: "این تنظیم استایل مجاز نیست."
        });
      }
    }

    const nextStyle: HomepageFieldStyle = {};

    if (style.fontKey != null && style.fontKey !== "") {
      const fontKey = typeof style.fontKey === "string" ? style.fontKey.trim() : "";

      if (!isSafeHomepageFontKey(fontKey)) {
        issues.push({
          path: `fieldStyles.${field}.fontKey`,
          code: "invalid_font",
          message: "فونت انتخاب‌شده معتبر نیست."
        });
      } else {
        nextStyle.fontKey = fontKey;
      }
    }

    if (style.color != null && style.color !== "") {
      if (typeof style.color !== "string" || !isHexColor(style.color.trim())) {
        issues.push({
          path: `fieldStyles.${field}.color`,
          code: "invalid_color",
          message: "رنگ انتخاب‌شده باید مثل #1a73e8 باشد."
        });
      } else {
        nextStyle.color = normalizeHex(style.color);
      }
    }

    if (style.fontWeight != null && style.fontWeight !== "") {
      const fontWeight = typeof style.fontWeight === "string" ? style.fontWeight : "";

      if (!isSafeHomepageFontWeight(nextStyle.fontKey, fontWeight)) {
        issues.push({
          path: `fieldStyles.${field}.fontWeight`,
          code: "invalid_font_weight",
          message: "وزن فونت انتخاب‌شده معتبر نیست."
        });
      } else {
        nextStyle.fontWeight = fontWeight;
      }
    }

    if (nextStyle.fontKey || nextStyle.color || nextStyle.fontWeight) {
      result[field as keyof HomepageFieldStyles] = nextStyle;
    }
  }

  return issues.length > 0 ? invalid(issues) : valid(result);
}

function hasListValue<TValue extends string>(items: readonly TValue[], value: unknown): value is TValue {
  return typeof value === "string" && items.some((item) => item === value);
}

function readBlockText(
  block: Record<string, unknown>,
  field: string,
  path: string,
  maxLength: number,
  issues: ValidationIssue[]
) {
  const value = block[field];

  if (value == null) {
    return "";
  }

  if (typeof value !== "string") {
    issues.push({
      path: `${path}.${field}`,
      code: "invalid_type",
      message: "متن باکس معتبر نیست."
    });
    return "";
  }

  const text = value.trim();

  if (text.length > maxLength) {
    issues.push({
      path: `${path}.${field}`,
      code: "too_long",
      message: "متن باکس طولانی‌تر از حد مجاز است."
    });
  }

  if (/<\/?[a-z][\s\S]*>/i.test(text)) {
    issues.push({
      path: `${path}.${field}`,
      code: "html_not_allowed",
      message: "HTML در متن باکس مجاز نیست."
    });
  }

  return text.slice(0, maxLength);
}

function readBlockColor(
  block: Record<string, unknown>,
  field: string,
  path: string,
  fallback: string,
  issues: ValidationIssue[]
) {
  const value = block[field];

  if (value == null || value === "") {
    return fallback;
  }

  if (typeof value !== "string" || !isHexColor(value.trim())) {
    issues.push({
      path: `${path}.${field}`,
      code: "invalid_color",
      message: "رنگ انتخاب‌شده باید مثل #1a73e8 باشد."
    });
    return fallback;
  }

  return normalizeHex(value);
}

function readBlockRadius(block: Record<string, unknown>, path: string, issues: ValidationIssue[]) {
  const value = block.radius;

  if (typeof value !== "number" || !Number.isFinite(value) || value < 8 || value > 40) {
    issues.push({
      path: `${path}.radius`,
      code: "invalid_radius",
      message: "گردی گوشه باید بین ۸ تا ۴۰ پیکسل باشد."
    });
    return 28;
  }

  return Math.round(value);
}

function normalizeCustomBlocksPayload(source: unknown): ValidationResult<HomepageCustomBlock[]> {
  if (source == null) {
    return valid([]);
  }

  if (!Array.isArray(source)) {
    return invalid([
      {
        path: "customBlocks",
        code: "invalid_type",
        message: "فهرست باکس‌های سفارشی معتبر نیست."
      }
    ]);
  }

  const issues: ValidationIssue[] = [];
  const result: HomepageCustomBlock[] = [];
  const seenIds = new Set<string>();

  if (source.length > HOMEPAGE_CUSTOM_BLOCK_MAX_COUNT) {
    issues.push({
      path: "customBlocks",
      code: "too_many_blocks",
      message: "حداکثر ۲۰ باکس سفارشی می‌توانی داشته باشی."
    });
  }

  for (const [index, rawBlock] of source.slice(0, HOMEPAGE_CUSTOM_BLOCK_MAX_COUNT).entries()) {
    const path = `customBlocks.${index}`;

    if (typeof rawBlock !== "object" || !rawBlock || Array.isArray(rawBlock)) {
      issues.push({
        path,
        code: "invalid_type",
        message: "باکس سفارشی معتبر نیست."
      });
      continue;
    }

    const block = rawBlock as Record<string, unknown>;
    const allowedKeys = new Set([
      "id",
      "type",
      "title",
      "body",
      "href",
      "ctaText",
      "fontKey",
      "textColor",
      "backgroundColor",
      "accentColor",
      "radius",
      "width",
      "align",
      "isVisible",
      "sortOrder",
      "placement"
    ]);

    for (const key of Object.keys(block)) {
      if (!allowedKeys.has(key)) {
        issues.push({
          path: `${path}.${key}`,
          code: "unknown_field",
          message: "این تنظیم برای باکس سفارشی مجاز نیست."
        });
      }
    }

    const id = typeof block.id === "string" ? block.id.trim() : "";

    if (!isSafeHomepageCustomBlockId(id) || seenIds.has(id)) {
      issues.push({
        path: `${path}.id`,
        code: "invalid_block_id",
        message: "شناسه باکس معتبر نیست."
      });
      continue;
    }

    seenIds.add(id);

    if (block.type !== "textCard") {
      issues.push({
        path: `${path}.type`,
        code: "invalid_block_type",
        message: "نوع باکس معتبر نیست."
      });
    }

    const href = readBlockText(block, "href", path, 500, issues);

    if (href && !isSafeInlineHref(href)) {
      issues.push({
        path: `${path}.href`,
        code: "unsafe_url",
        message: "لینک باکس معتبر نیست."
      });
    }

    const fontKey = typeof block.fontKey === "string" ? block.fontKey.trim() : "";

    if (!isSafeHomepageFontKey(fontKey)) {
      issues.push({
        path: `${path}.fontKey`,
        code: "invalid_font",
        message: "فونت انتخاب‌شده معتبر نیست."
      });
    }

    if (typeof block.isVisible !== "boolean") {
      issues.push({
        path: `${path}.isVisible`,
        code: "invalid_type",
        message: "وضعیت نمایش باکس معتبر نیست."
      });
    }

    if (typeof block.sortOrder !== "number" || !Number.isFinite(block.sortOrder)) {
      issues.push({
        path: `${path}.sortOrder`,
        code: "invalid_sort_order",
        message: "ترتیب باکس معتبر نیست."
      });
    }

    if (!hasListValue(HOMEPAGE_CUSTOM_BLOCK_PLACEMENTS, block.placement)) {
      issues.push({
        path: `${path}.placement`,
        code: "invalid_placement",
        message: "جایگاه باکس معتبر نیست."
      });
    }

    if (!hasListValue(HOMEPAGE_CUSTOM_BLOCK_WIDTHS, block.width)) {
      issues.push({
        path: `${path}.width`,
        code: "invalid_width",
        message: "عرض باکس معتبر نیست."
      });
    }

    if (!hasListValue(HOMEPAGE_CUSTOM_BLOCK_ALIGNS, block.align)) {
      issues.push({
        path: `${path}.align`,
        code: "invalid_align",
        message: "چینش متن باکس معتبر نیست."
      });
    }

    result.push({
      id,
      type: "textCard",
      title: readBlockText(block, "title", path, 140, issues),
      body: readBlockText(block, "body", path, 900, issues),
      href,
      ctaText: readBlockText(block, "ctaText", path, 80, issues),
      fontKey: isSafeHomepageFontKey(fontKey) ? fontKey : "vazirmatn",
      textColor: readBlockColor(block, "textColor", path, "#172033", issues),
      backgroundColor: readBlockColor(block, "backgroundColor", path, "#ffffff", issues),
      accentColor: readBlockColor(block, "accentColor", path, "#1a73e8", issues),
      radius: readBlockRadius(block, path, issues),
      width: hasListValue(HOMEPAGE_CUSTOM_BLOCK_WIDTHS, block.width)
        ? (block.width as HomepageCustomBlockWidth)
        : "normal",
      align: hasListValue(HOMEPAGE_CUSTOM_BLOCK_ALIGNS, block.align)
        ? (block.align as HomepageCustomBlockAlign)
        : "start",
      isVisible: typeof block.isVisible === "boolean" ? block.isVisible : true,
      sortOrder: typeof block.sortOrder === "number" && Number.isFinite(block.sortOrder) ? Math.round(block.sortOrder) : (index + 1) * 10,
      placement: hasListValue(HOMEPAGE_CUSTOM_BLOCK_PLACEMENTS, block.placement)
        ? (block.placement as HomepageCustomBlockPlacement)
        : "afterHero"
    });
  }

  return issues.length > 0
    ? invalid(issues)
    : valid(result.sort((left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id)));
}

function normalizeLayoutSettingsPayload(source: unknown): ValidationResult<HomepageLayoutSettings> {
  const layout = normalizeHomepageLayoutSettings(source);

  if (!layout) {
    return invalid([
      {
        path: "layoutSettings",
        code: "invalid_layout",
        message: "تنظیمات چیدمان معتبر نیست."
      }
    ]);
  }

  return valid(layout);
}

async function logValidationFailure(params: {
  requestContext: ReturnType<typeof createRequestContext>;
  userId: string;
  issues: ValidationIssue[];
}) {
  await logServerEvent({
    level: "warn",
    event: "admin.homepage_inline_validation_failed",
    message: "Homepage inline editor payload failed validation",
    requestId: params.requestContext.requestId,
    route: params.requestContext.route,
    method: params.requestContext.method,
    userId: params.userId,
    entityType: "homepage_settings",
    entityId: HOMEPAGE_SETTINGS_ID,
    data: {
      issues: params.issues.map((issue) => ({
        path: issue.path,
        code: issue.code
      }))
    }
  });
}

async function recordCustomBlockAuditEvents(params: {
  previousBlocks: HomepageCustomBlock[];
  nextBlocks: HomepageCustomBlock[];
  userId: string;
  requestContext: ReturnType<typeof createRequestContext>;
}) {
  const previousById = new Map(params.previousBlocks.map((block) => [block.id, block]));
  const nextById = new Map(params.nextBlocks.map((block) => [block.id, block]));

  for (const block of params.nextBlocks) {
    const previous = previousById.get(block.id);

    if (!previous) {
      await recordAuditEvent({
        action: "admin.homepage_block_created",
        entityType: "homepage_settings",
        entityId: HOMEPAGE_SETTINGS_ID,
        userId: params.userId,
        requestContext: params.requestContext,
        details: { blockId: block.id, placement: block.placement, source: "homepage-inline-editor" },
        message: "Super admin created homepage custom block"
      });
      continue;
    }

    if (previous.isVisible !== block.isVisible) {
      await recordAuditEvent({
        action: "admin.homepage_block_visibility_updated",
        entityType: "homepage_settings",
        entityId: HOMEPAGE_SETTINGS_ID,
        userId: params.userId,
        requestContext: params.requestContext,
        details: { blockId: block.id, isVisible: block.isVisible, source: "homepage-inline-editor" },
        message: "Super admin updated homepage custom block visibility"
      });
    }

    if (previous.sortOrder !== block.sortOrder || previous.placement !== block.placement) {
      await recordAuditEvent({
        action: "admin.homepage_block_reordered",
        entityType: "homepage_settings",
        entityId: HOMEPAGE_SETTINGS_ID,
        userId: params.userId,
        requestContext: params.requestContext,
        details: {
          blockId: block.id,
          previousSortOrder: previous.sortOrder,
          nextSortOrder: block.sortOrder,
          previousPlacement: previous.placement,
          nextPlacement: block.placement,
          source: "homepage-inline-editor"
        },
        message: "Super admin reordered homepage custom block"
      });
    }

    if (JSON.stringify(previous) !== JSON.stringify(block)) {
      await recordAuditEvent({
        action: "admin.homepage_block_updated",
        entityType: "homepage_settings",
        entityId: HOMEPAGE_SETTINGS_ID,
        userId: params.userId,
        requestContext: params.requestContext,
        details: { blockId: block.id, source: "homepage-inline-editor" },
        message: "Super admin updated homepage custom block"
      });
    }
  }

  for (const block of params.previousBlocks) {
    if (nextById.has(block.id)) {
      continue;
    }

    await recordAuditEvent({
      action: "admin.homepage_block_deleted",
      entityType: "homepage_settings",
      entityId: HOMEPAGE_SETTINGS_ID,
      userId: params.userId,
      requestContext: params.requestContext,
      details: { blockId: block.id, placement: block.placement, source: "homepage-inline-editor" },
      message: "Super admin deleted homepage custom block"
    });
  }
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

  const currentSiteSettings = await getStoredSiteSettings();
  const themeFallback = normalizeInlineThemeValues(currentSiteSettings || {}, fallbackStorefrontSettings.appearance);
  const homepage = normalizeHomepagePayload(payload.homepage);
  const theme = normalizeThemePayload(payload.theme, themeFallback);
  const fieldStyles = normalizeFieldStylesPayload(payload.fieldStyles);
  const customBlocks = normalizeCustomBlocksPayload(payload.customBlocks);
  const layoutSettings = normalizeLayoutSettingsPayload(payload.layoutSettings);
  const validationIssues = [
    ...homepage.issues,
    ...theme.issues,
    ...fieldStyles.issues,
    ...customBlocks.issues,
    ...layoutSettings.issues
  ];

  if (validationIssues.length > 0 || !homepage.ok || !theme.ok || !fieldStyles.ok || !customBlocks.ok || !layoutSettings.ok) {
    await logValidationFailure({ requestContext, userId: session.userId, issues: validationIssues });

    return jsonWithContext(
      requestContext,
      {
        error: "invalid-payload",
        message: validationIssues[0]?.message || "ذخیره انجام نشد. مقدارهای واردشده را بررسی کن.",
        fieldErrors: validationIssues
      },
      { status: 400 }
    );
  }

  const previousSettings = await getStoredHomepageSettings();
  const previousCustomBlocks = normalizeHomepageCustomBlocks(previousSettings?.homepageFieldStyles);
  const imageChanges = INLINE_HOMEPAGE_IMAGE_FIELDS.map((field) => {
    const previousValue = typeof previousSettings?.[field] === "string" ? previousSettings[field]?.trim() || "" : "";
    const nextValue = homepage.value[field]?.trim() || "";

    return previousValue === nextValue
      ? null
      : {
          field,
          previousValue,
          nextValue,
          action: nextValue ? "admin.homepage_inline_image_updated" : "admin.homepage_inline_image_reset"
        };
  }).filter((change): change is NonNullable<typeof change> => Boolean(change));

  await saveInlineHomepageSettings(homepage.value, session.userId, fieldStyles.value, layoutSettings.value, customBlocks.value);
  await saveInlineSiteAppearanceSettings(theme.value, session.userId);
  await recordCustomBlockAuditEvents({
    previousBlocks: previousCustomBlocks,
    nextBlocks: customBlocks.value,
    userId: session.userId,
    requestContext
  });

  for (const change of imageChanges) {
    await recordAuditEvent({
      action: change.action,
      entityType: "homepage_settings",
      entityId: HOMEPAGE_SETTINGS_ID,
      userId: session.userId,
      requestContext,
      details: {
        field: change.field,
        previousValue: change.previousValue || null,
        nextValue: change.nextValue || null,
        source: "homepage-inline-editor"
      },
      message:
        change.action === "admin.homepage_inline_image_reset"
          ? "Super admin reset homepage inline image"
          : "Super admin updated homepage inline image"
    });
  }

  await recordAuditEvent({
    action: "admin.homepage_inline_updated",
    entityType: "homepage_settings",
    entityId: HOMEPAGE_SETTINGS_ID,
    userId: session.userId,
    requestContext,
    details: {
      fields: [...INLINE_HOMEPAGE_TEXT_FIELDS, ...INLINE_HOMEPAGE_VISIBILITY_FIELDS],
      styledFields: Object.keys(fieldStyles.value),
      customBlockCount: customBlocks.value.length,
      layoutSections: Object.keys(layoutSettings.value),
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
      styledFields: Object.keys(fieldStyles.value),
      source: "homepage-inline-editor"
    },
    message: "Super admin updated homepage inline text styles"
  });

  await recordAuditEvent({
    action: "admin.homepage_inline_layout_updated",
    entityType: "homepage_settings",
    entityId: HOMEPAGE_SETTINGS_ID,
    userId: session.userId,
    requestContext,
    details: {
      layoutSettings: layoutSettings.value,
      source: "homepage-inline-editor"
    },
    message: "Super admin updated homepage inline layout settings"
  });

  await recordAuditEvent({
    action: "admin.site_theme_inline_updated",
    entityType: "site_settings",
    entityId: SITE_SETTINGS_ID,
    userId: session.userId,
    requestContext,
    details: {
      fields: [...INLINE_THEME_FIELD_KEYS],
      appearance: theme.value,
      source: "homepage-inline-editor"
    },
    message: "Super admin updated site theme through inline editor"
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");
  revalidatePath("/admin/settings");

  return jsonWithContext(requestContext, { ok: true });
}
