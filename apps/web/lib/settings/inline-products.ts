import {
  type InlineTextStyles,
  normalizeInlineTextStyles
} from "@/lib/settings/inline-homepage";

export const INLINE_PRODUCTS_PAGE_FIELDS = [
  "heroEyebrow",
  "pageTitle",
  "pageDescription",
  "categoryHeadingPrefix",
  "filtersLabel",
  "filtersHelpText",
  "resultsChipSuffix",
  "supportChipText",
  "cartCtaLabel",
  "emptyTitle",
  "emptyDescription",
  "emptyCtaLabel"
] as const;

export type InlineProductsPageField = (typeof INLINE_PRODUCTS_PAGE_FIELDS)[number];

export type InlineProductsPageValues = Record<InlineProductsPageField, string>;
export type InlineProductsPageFieldStyles = InlineTextStyles<InlineProductsPageField>;

export const INLINE_PRODUCTS_PAGE_FIELD_LABELS: Record<InlineProductsPageField, string> = {
  heroEyebrow: "برچسب بالای صفحه محصولات",
  pageTitle: "عنوان صفحه محصولات",
  pageDescription: "توضیح صفحه محصولات",
  categoryHeadingPrefix: "پیشوند عنوان دسته",
  filtersLabel: "عنوان بخش فیلترها",
  filtersHelpText: "راهنمای فیلترها",
  resultsChipSuffix: "پسوند تعداد نتایج",
  supportChipText: "متن چیپ پشتیبانی",
  cartCtaLabel: "متن CTA سبد خرید",
  emptyTitle: "عنوان حالت خالی",
  emptyDescription: "توضیح حالت خالی",
  emptyCtaLabel: "متن دکمه حالت خالی"
};

export const DEFAULT_INLINE_PRODUCTS_PAGE_VALUES: InlineProductsPageValues = {
  heroEyebrow: "فروشگاه FumGPT",
  pageTitle: "همه محصولات",
  pageDescription: "فهرست محصولات و خدمات فروشگاه FumGPT با قیمت‌گذاری روشن، توضیح تحویل، و مسیر خرید قابل پیگیری.",
  categoryHeadingPrefix: "محصولات دسته",
  filtersLabel: "مرور دسته‌بندی‌ها",
  filtersHelpText: "برای دیدن محصولات هر دسته، فیلتر مناسب را انتخاب کن.",
  resultsChipSuffix: "محصول",
  supportChipText: "پشتیبانی فارسی",
  cartCtaLabel: "سبد خرید",
  emptyTitle: "در این دسته هنوز محصول فعالی وجود ندارد",
  emptyDescription: "به‌زودی محصولات این دسته اضافه می‌شوند. فعلاً می‌توانی همه محصولات فعال فروشگاه را ببینی.",
  emptyCtaLabel: "بازگشت به همه محصولات"
};

export function normalizeInlineProductsPageValues(
  value: unknown,
  fallback: InlineProductsPageValues = DEFAULT_INLINE_PRODUCTS_PAGE_VALUES
): InlineProductsPageValues {
  const source =
    typeof value === "object" && value && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

  return {
    heroEyebrow: typeof source.heroEyebrow === "string" && source.heroEyebrow.trim() ? source.heroEyebrow.trim() : fallback.heroEyebrow,
    pageTitle: typeof source.pageTitle === "string" && source.pageTitle.trim() ? source.pageTitle.trim() : fallback.pageTitle,
    pageDescription:
      typeof source.pageDescription === "string" && source.pageDescription.trim()
        ? source.pageDescription.trim()
        : fallback.pageDescription,
    categoryHeadingPrefix:
      typeof source.categoryHeadingPrefix === "string" && source.categoryHeadingPrefix.trim()
        ? source.categoryHeadingPrefix.trim()
        : fallback.categoryHeadingPrefix,
    filtersLabel:
      typeof source.filtersLabel === "string" && source.filtersLabel.trim()
        ? source.filtersLabel.trim()
        : fallback.filtersLabel,
    filtersHelpText:
      typeof source.filtersHelpText === "string" && source.filtersHelpText.trim()
        ? source.filtersHelpText.trim()
        : fallback.filtersHelpText,
    resultsChipSuffix:
      typeof source.resultsChipSuffix === "string" && source.resultsChipSuffix.trim()
        ? source.resultsChipSuffix.trim()
        : fallback.resultsChipSuffix,
    supportChipText:
      typeof source.supportChipText === "string" && source.supportChipText.trim()
        ? source.supportChipText.trim()
        : fallback.supportChipText,
    cartCtaLabel:
      typeof source.cartCtaLabel === "string" && source.cartCtaLabel.trim()
        ? source.cartCtaLabel.trim()
        : fallback.cartCtaLabel,
    emptyTitle:
      typeof source.emptyTitle === "string" && source.emptyTitle.trim() ? source.emptyTitle.trim() : fallback.emptyTitle,
    emptyDescription:
      typeof source.emptyDescription === "string" && source.emptyDescription.trim()
        ? source.emptyDescription.trim()
        : fallback.emptyDescription,
    emptyCtaLabel:
      typeof source.emptyCtaLabel === "string" && source.emptyCtaLabel.trim()
        ? source.emptyCtaLabel.trim()
        : fallback.emptyCtaLabel
  };
}

export function validateInlineProductsPageValues(value: unknown): InlineProductsPageValues | null {
  if (typeof value !== "object" || !value || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const allowedKeys = new Set(INLINE_PRODUCTS_PAGE_FIELDS);

  for (const key of Object.keys(source)) {
    if (!allowedKeys.has(key as InlineProductsPageField)) {
      return null;
    }
  }

  for (const field of INLINE_PRODUCTS_PAGE_FIELDS) {
    if (typeof source[field] !== "string" || !source[field].trim()) {
      return null;
    }
  }

  return normalizeInlineProductsPageValues(source);
}

export function normalizeInlineProductsPageFieldStyles(value: unknown) {
  return normalizeInlineTextStyles(value, INLINE_PRODUCTS_PAGE_FIELDS);
}
