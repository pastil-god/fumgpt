import type { StoreProduct } from "@prisma/client";
import {
  categories,
  getDiscountPercent,
  type Product,
  type ProductCategory
} from "@/lib/mock-data";
import { isSafeInlineHref, isSafeInlineImageUrl } from "@/lib/settings/inline-homepage";

const INTERNAL_PRODUCTS_FEATURE_FLAG = "PRODUCTS_INTERNAL_ENABLED";
const INTERNAL_PRODUCTS_ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
const HTML_TAG_PATTERN = /<[^>]+>/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_PRICE_AMOUNT = 999_999_999_999;
const MIN_SORT_ORDER = -10_000;
const MAX_SORT_ORDER = 10_000;

const PRODUCT_CATEGORY_KEYS = categories
  .map((item) => item.key)
  .filter((key): key is ProductCategory => key !== "all");
const PRODUCT_CATEGORY_KEY_SET = new Set<ProductCategory>(PRODUCT_CATEGORY_KEYS);

export const INTERNAL_PRODUCT_STATUS_FILTERS = ["all", "active", "inactive"] as const;
export const INTERNAL_PRODUCT_FEATURED_FILTERS = ["all", "featured", "not_featured"] as const;

export type InternalProductStatusFilter = (typeof INTERNAL_PRODUCT_STATUS_FILTERS)[number];
export type InternalProductFeaturedFilter = (typeof INTERNAL_PRODUCT_FEATURED_FILTERS)[number];

export type InternalProductMutationInput = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string | null;
  priceAmount: number | null;
  comparePriceAmount: number | null;
  priceLabel: string | null;
  currency: string;
  badge: string | null;
  category: ProductCategory | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  source: "internal";
};

export class InternalProductValidationError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "InternalProductValidationError";
  }
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanOptionalText(value: unknown) {
  const text = cleanText(value);
  return text ? text : null;
}

function ensureNoHtml(value: string | null, field: string) {
  if (!value) {
    return;
  }

  if (HTML_TAG_PATTERN.test(value)) {
    throw new InternalProductValidationError(
      `invalid-${field}-html`,
      "ورودی HTML مجاز نیست و باید متن ساده باشد."
    );
  }
}

function parseIntegerField(value: unknown, field: string, options?: { required?: boolean; min?: number; max?: number }) {
  const text = cleanText(value);

  if (!text) {
    if (options?.required) {
      throw new InternalProductValidationError(`required-${field}`, `${field} الزامی است.`);
    }

    return null;
  }

  if (!/^-?\d+$/.test(text)) {
    throw new InternalProductValidationError(`invalid-${field}`, `${field} باید عدد صحیح باشد.`);
  }

  const parsed = Number.parseInt(text, 10);

  if (!Number.isFinite(parsed)) {
    throw new InternalProductValidationError(`invalid-${field}`, `${field} معتبر نیست.`);
  }

  if (typeof options?.min === "number" && parsed < options.min) {
    throw new InternalProductValidationError(`invalid-${field}-min`, `${field} کمتر از حد مجاز است.`);
  }

  if (typeof options?.max === "number" && parsed > options.max) {
    throw new InternalProductValidationError(`invalid-${field}-max`, `${field} بیشتر از حد مجاز است.`);
  }

  return parsed;
}

function parseBooleanField(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = cleanText(value).toLowerCase();

  if (!text) {
    return false;
  }

  return text === "on" || text === "true" || text === "1" || text === "yes";
}

function parseFeatures(value: unknown) {
  if (Array.isArray(value)) {
    const features = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const feature of features) {
      ensureNoHtml(feature, "features");
    }

    return features;
  }

  const text = cleanText(value);

  if (!text) {
    return [] as string[];
  }

  const features = text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  for (const feature of features) {
    ensureNoHtml(feature, "features");
  }

  return features;
}

function parseCategory(value: unknown) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  if (!PRODUCT_CATEGORY_KEY_SET.has(text as ProductCategory)) {
    throw new InternalProductValidationError("invalid-category", "دسته‌بندی انتخاب‌شده معتبر نیست.");
  }

  return text as ProductCategory;
}

function parseCurrency(value: unknown) {
  const text = cleanText(value).toUpperCase();

  if (!text) {
    return "IRR";
  }

  if (!/^[A-Z]{3}$/.test(text)) {
    throw new InternalProductValidationError("invalid-currency", "کد ارز باید سه حرفی باشد.");
  }

  return text;
}

function parseSlug(value: unknown) {
  const slug = cleanText(value);

  if (!slug) {
    throw new InternalProductValidationError("required-slug", "اسلاگ الزامی است.");
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new InternalProductValidationError(
      "invalid-slug",
      "اسلاگ باید فقط شامل حروف کوچک انگلیسی، عدد و خط تیره باشد."
    );
  }

  return slug;
}

function parseImageUrl(value: unknown) {
  const url = cleanOptionalText(value);

  if (!url) {
    return null;
  }

  if (!isSafeInlineImageUrl(url)) {
    throw new InternalProductValidationError("invalid-image-url", "آدرس تصویر معتبر نیست.");
  }

  return url;
}

function parseCtaHref(value: unknown) {
  const href = cleanOptionalText(value);

  if (!href) {
    return null;
  }

  if (!isSafeInlineHref(href)) {
    throw new InternalProductValidationError("invalid-cta-href", "لینک CTA معتبر نیست.");
  }

  return href;
}

function validateTextFields(input: {
  title: string;
  shortDescription: string;
  description: string | null;
  priceLabel: string | null;
  badge: string | null;
  ctaText: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}) {
  ensureNoHtml(input.title, "title");
  ensureNoHtml(input.shortDescription, "shortDescription");
  ensureNoHtml(input.description, "description");
  ensureNoHtml(input.priceLabel, "priceLabel");
  ensureNoHtml(input.badge, "badge");
  ensureNoHtml(input.ctaText, "ctaText");
  ensureNoHtml(input.seoTitle, "seoTitle");
  ensureNoHtml(input.seoDescription, "seoDescription");

  if (!input.title) {
    throw new InternalProductValidationError("required-title", "عنوان محصول الزامی است.");
  }

  if (!input.shortDescription) {
    throw new InternalProductValidationError("required-short-description", "توضیح کوتاه محصول الزامی است.");
  }
}

type ParseMode = "create" | "update";

export function normalizeInternalProductInput(
  source: Record<string, unknown>,
  mode: ParseMode
): InternalProductMutationInput {
  const title = cleanText(source.title);
  const shortDescription = cleanText(source.shortDescription);
  const description = cleanOptionalText(source.description);
  const priceLabel = cleanOptionalText(source.priceLabel);
  const badge = cleanOptionalText(source.badge);
  const ctaText = cleanOptionalText(source.ctaText);
  const seoTitle = cleanOptionalText(source.seoTitle);
  const seoDescription = cleanOptionalText(source.seoDescription);
  const slug = parseSlug(source.slug);
  const priceAmount = parseIntegerField(source.priceAmount, "priceAmount", {
    min: 0,
    max: MAX_PRICE_AMOUNT
  });
  const comparePriceAmount = parseIntegerField(source.comparePriceAmount, "comparePriceAmount", {
    min: 0,
    max: MAX_PRICE_AMOUNT
  });
  const sortOrder = parseIntegerField(source.sortOrder, "sortOrder", {
    min: MIN_SORT_ORDER,
    max: MAX_SORT_ORDER
  });

  validateTextFields({
    title,
    shortDescription,
    description,
    priceLabel,
    badge,
    ctaText,
    seoTitle,
    seoDescription
  });

  if (comparePriceAmount !== null && priceAmount !== null && comparePriceAmount < priceAmount) {
    throw new InternalProductValidationError(
      "invalid-compare-price",
      "قیمت قبل نمی‌تواند کمتر از قیمت فعلی باشد."
    );
  }

  return {
    slug,
    title,
    shortDescription,
    description,
    priceAmount,
    comparePriceAmount,
    priceLabel,
    currency: parseCurrency(source.currency),
    badge,
    category: parseCategory(source.category),
    imageUrl: parseImageUrl(source.imageUrl),
    ctaText,
    ctaHref: parseCtaHref(source.ctaHref),
    features: parseFeatures(source.features),
    isActive: parseBooleanField(source.isActive),
    isFeatured: parseBooleanField(source.isFeatured),
    sortOrder: sortOrder ?? 0,
    seoTitle,
    seoDescription,
    source: "internal"
  };
}

export function normalizeInternalProductFormData(formData: FormData, mode: ParseMode) {
  const source = Object.fromEntries(formData.entries());
  return normalizeInternalProductInput(source, mode);
}

export function normalizeInternalStatusFilter(value: string | null | undefined): InternalProductStatusFilter {
  const normalized = cleanText(value).toLowerCase();
  return INTERNAL_PRODUCT_STATUS_FILTERS.includes(normalized as InternalProductStatusFilter)
    ? (normalized as InternalProductStatusFilter)
    : "all";
}

export function normalizeInternalFeaturedFilter(value: string | null | undefined): InternalProductFeaturedFilter {
  const normalized = cleanText(value).toLowerCase();
  return INTERNAL_PRODUCT_FEATURED_FILTERS.includes(normalized as InternalProductFeaturedFilter)
    ? (normalized as InternalProductFeaturedFilter)
    : "all";
}

export function isInternalProductsEnabled() {
  const raw = process.env[INTERNAL_PRODUCTS_FEATURE_FLAG];
  return raw ? INTERNAL_PRODUCTS_ENABLED_VALUES.has(raw.trim().toLowerCase()) : false;
}

function normalizeInternalFeatures(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const features = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return features.length > 0 ? features : fallback;
}

function resolveCategory(value: string | null | undefined, fallback: ProductCategory | undefined) {
  if (value && PRODUCT_CATEGORY_KEY_SET.has(value as ProductCategory)) {
    return value as ProductCategory;
  }

  return fallback || "ai-access";
}

export function mapInternalStoreProductToStorefrontProduct(
  internal: StoreProduct,
  fallbackProduct?: Product
): Product {
  const price = Math.max(0, Math.floor(internal.priceAmount ?? fallbackProduct?.price ?? 0));
  const fallbackCompare = fallbackProduct?.comparePrice ?? price;
  const compareCandidate = Math.floor(internal.comparePriceAmount ?? fallbackCompare);
  const comparePrice = Math.max(1, price, Number.isFinite(compareCandidate) ? compareCandidate : price);
  const features = normalizeInternalFeatures(internal.features, fallbackProduct?.features || []);
  const badge =
    internal.badge ||
    fallbackProduct?.badge ||
    (comparePrice > price ? `${getDiscountPercent(comparePrice, price).toLocaleString("fa-IR")}٪ تخفیف` : "پیشنهاد ویژه");

  return {
    ...fallbackProduct,
    id: internal.id,
    slug: internal.slug,
    title: internal.title,
    category: resolveCategory(internal.category, fallbackProduct?.category),
    brand: fallbackProduct?.brand || "FumGPT",
    price,
    comparePrice,
    currency: "IRR",
    delivery: internal.priceLabel || fallbackProduct?.delivery || "تحویل دیجیتال",
    shortDescription: internal.shortDescription,
    description: internal.description || internal.shortDescription,
    features,
    notes: fallbackProduct?.notes || [],
    badge,
    coverLabel: fallbackProduct?.coverLabel || internal.title,
    accent: fallbackProduct?.accent || "cyan",
    isFeatured: internal.isFeatured,
    status: internal.isActive ? "active" : "draft",
    imageUrl: internal.imageUrl || fallbackProduct?.imageUrl,
    galleryImageUrls: fallbackProduct?.galleryImageUrls,
    videoUrl: fallbackProduct?.videoUrl,
    supportNote: fallbackProduct?.supportNote,
    trustNote: fallbackProduct?.trustNote,
    priority: internal.sortOrder,
    priceLabel: internal.priceLabel || undefined,
    seoTitle: internal.seoTitle || undefined,
    seoDescription: internal.seoDescription || undefined,
    ctaText: internal.ctaText || undefined,
    ctaHref: internal.ctaHref || undefined
  };
}

export function getInternalProductCategoryOptions() {
  return PRODUCT_CATEGORY_KEYS;
}

export type InternalProductFormDefaults = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceAmount: string;
  comparePriceAmount: string;
  priceLabel: string;
  currency: string;
  badge: string;
  category: string;
  imageUrl: string;
  ctaText: string;
  ctaHref: string;
  features: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
};

export function getInternalProductFormDefaults(product?: StoreProduct | null): InternalProductFormDefaults {
  return {
    title: product?.title || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    priceAmount: typeof product?.priceAmount === "number" ? String(product.priceAmount) : "",
    comparePriceAmount: typeof product?.comparePriceAmount === "number" ? String(product.comparePriceAmount) : "",
    priceLabel: product?.priceLabel || "",
    currency: product?.currency || "IRR",
    badge: product?.badge || "",
    category: product?.category || "",
    imageUrl: product?.imageUrl || "",
    ctaText: product?.ctaText || "",
    ctaHref: product?.ctaHref || "",
    features: Array.isArray(product?.features)
      ? product.features
          .filter((item): item is string => typeof item === "string")
          .join("\n")
      : "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    sortOrder: typeof product?.sortOrder === "number" ? String(product.sortOrder) : "0",
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || ""
  };
}

export function buildInternalProductPreview(defaults: InternalProductFormDefaults): Product {
  const title = defaults.title.trim() || "نام محصول";
  const shortDescription = defaults.shortDescription.trim() || "توضیح کوتاه محصول";
  const description = defaults.description.trim() || shortDescription;
  const price = Number.parseInt(defaults.priceAmount || "0", 10);
  const normalizedPrice = Number.isFinite(price) && price >= 0 ? price : 0;
  const comparePrice = Number.parseInt(defaults.comparePriceAmount || "", 10);
  const normalizedCompare =
    Number.isFinite(comparePrice) && comparePrice >= normalizedPrice
      ? comparePrice
      : Math.max(normalizedPrice, normalizedPrice > 0 ? normalizedPrice : 1);

  return {
    id: "preview",
    slug: defaults.slug.trim() || "new-product",
    title,
    category: resolveCategory(defaults.category, "ai-access"),
    brand: "FumGPT",
    price: normalizedPrice,
    comparePrice: normalizedCompare,
    currency: "IRR",
    delivery: defaults.priceLabel.trim() || "تحویل دیجیتال",
    shortDescription,
    description,
    features: defaults.features
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
    notes: [],
    badge: defaults.badge.trim() || "محصول داخلی",
    coverLabel: title,
    accent: "cyan",
    isFeatured: defaults.isFeatured,
    status: defaults.isActive ? "active" : "draft",
    imageUrl: defaults.imageUrl.trim() || undefined,
    priority: Number.parseInt(defaults.sortOrder || "0", 10) || 0,
    ctaText: defaults.ctaText.trim() || undefined,
    ctaHref: defaults.ctaHref.trim() || undefined,
    seoTitle: defaults.seoTitle.trim() || undefined,
    seoDescription: defaults.seoDescription.trim() || undefined
  };
}
