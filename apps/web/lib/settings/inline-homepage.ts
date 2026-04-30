import type { CSSProperties } from "react";

export const INLINE_HOMEPAGE_TEXT_FIELDS = [
  "heroEyebrow",
  "heroStatusLabel",
  "heroTitleLead",
  "heroTitleHighlight",
  "heroTitleTail",
  "heroDescription",
  "heroPrimaryCtaLabel",
  "heroPrimaryCtaHref",
  "heroSecondaryCtaLabel",
  "heroSecondaryCtaHref",
  "heroProofTitle",
  "heroProofText",
  "heroQuickStartTitle",
  "heroQuickStartText",
  "heroMarketLabel",
  "heroMarketTitle",
  "heroMarketDescription",
  "heroMarketBadge",
  "categoriesEyebrow",
  "categoriesTitle",
  "categoriesDescription",
  "categoriesCtaLabel",
  "categoriesCtaHref",
  "featuredEyebrow",
  "featuredTitle",
  "featuredDescription",
  "featuredCtaLabel",
  "featuredCtaHref",
  "newsEyebrow",
  "newsTitle",
  "newsDescription",
  "newsCtaLabel",
  "newsCtaHref",
  "trustEyebrow",
  "trustTitle",
  "trustPoints",
  "roadmapEyebrow",
  "roadmapTitle",
  "roadmapPhase1Title",
  "roadmapPhase1Description",
  "roadmapPhase2Title",
  "roadmapPhase2Description",
  "roadmapPhase3Title",
  "roadmapPhase3Description",
  "announcementLabel",
  "announcementTitle",
  "announcementDescription",
  "announcementCtaLabel",
  "announcementCtaHref"
] as const;

export const INLINE_HOMEPAGE_VISIBILITY_FIELDS = [
  "showCategorySection",
  "showFeaturedSection",
  "showNewsSection",
  "showTrustSection",
  "showRoadmapSection",
  "showAnnouncement"
] as const;

export const INLINE_HOMEPAGE_IMAGE_FIELDS = ["heroImageUrl"] as const;

export const INLINE_HOMEPAGE_HREF_FIELDS = [
  "heroPrimaryCtaHref",
  "heroSecondaryCtaHref",
  "categoriesCtaHref",
  "featuredCtaHref",
  "newsCtaHref",
  "announcementCtaHref"
] as const;

export type InlineHomepageTextField = (typeof INLINE_HOMEPAGE_TEXT_FIELDS)[number];
export type InlineHomepageVisibilityField = (typeof INLINE_HOMEPAGE_VISIBILITY_FIELDS)[number];
export type InlineHomepageImageField = (typeof INLINE_HOMEPAGE_IMAGE_FIELDS)[number];
export type InlineHomepageHrefField = (typeof INLINE_HOMEPAGE_HREF_FIELDS)[number];

export type InlineHomepageValues = Record<InlineHomepageTextField, string> &
  Record<InlineHomepageImageField, string> &
  Record<InlineHomepageVisibilityField, boolean>;

export const INLINE_FONT_DEFAULT_KEY = "vazirmatn" as const;
export const INLINE_FONT_FAMILY_FALLBACK = "\"Vazirmatn\", \"Inter\", system-ui, sans-serif";

export const HOMEPAGE_FONT_REGISTRY = [
  {
    fontKey: "vazirmatn",
    label: "وزیرمتن",
    englishLabel: "Vazirmatn",
    cssFontFamily: INLINE_FONT_FAMILY_FALLBACK,
    recommendedUsage: "body",
    usageHint: "مناسب متن",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "inter",
    label: "اینتر",
    englishLabel: "Inter",
    cssFontFamily: "\"Inter\", \"Vazirmatn\", system-ui, sans-serif",
    recommendedUsage: "heading",
    usageHint: "مناسب رابط",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "notoSansArabic",
    label: "نوتو سنس عربی",
    englishLabel: "Noto Sans Arabic",
    cssFontFamily: "\"Noto Sans Arabic\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    usageHint: "مناسب متن",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "notoNaskhArabic",
    label: "نوتو نسخ عربی",
    englishLabel: "Noto Naskh Arabic",
    cssFontFamily: "\"Noto Naskh Arabic\", \"Vazirmatn\", \"Inter\", serif",
    recommendedUsage: "heading",
    usageHint: "مناسب متن",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "cairo",
    label: "قاهره",
    englishLabel: "Cairo",
    cssFontFamily: "\"Cairo\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    usageHint: "مناسب عنوان",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "tajawal",
    label: "تجوال",
    englishLabel: "Tajawal",
    cssFontFamily: "\"Tajawal\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    usageHint: "مناسب عنوان",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "almarai",
    label: "المراعی",
    englishLabel: "Almarai",
    cssFontFamily: "\"Almarai\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    usageHint: "مناسب متن",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "changa",
    label: "چانگا",
    englishLabel: "Changa",
    cssFontFamily: "\"Changa\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "display",
    usageHint: "نمایشی",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "ibmPlexSansArabic",
    label: "IBM Plex Sans Arabic",
    englishLabel: "IBM Plex Sans Arabic",
    cssFontFamily: "\"IBM Plex Sans Arabic\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    usageHint: "مناسب رابط",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "markaziText",
    label: "مرکزی تکست",
    englishLabel: "Markazi Text",
    cssFontFamily: "\"Markazi Text\", \"Vazirmatn\", \"Inter\", serif",
    recommendedUsage: "display",
    usageHint: "نمایشی",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "lalezar",
    label: "لاله‌زار",
    englishLabel: "Lalezar",
    cssFontFamily: "\"Lalezar\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "display",
    usageHint: "نمایشی",
    previewText: "نمونه متن فارسی",
    loaded: true,
    allowedWeights: ["400"]
  }
] as const;

export type HomepageFontOption = (typeof HOMEPAGE_FONT_REGISTRY)[number];
export type HomepageFontKey = HomepageFontOption["fontKey"];
export type HomepageFontWeight = HomepageFontOption["allowedWeights"][number];

export const INLINE_FONT_OPTIONS: Array<{
  label: string;
  englishLabel?: string;
  value: HomepageFontKey;
  recommendedUsage: HomepageFontOption["recommendedUsage"];
  usageHint: string;
  previewText: string;
  cssFontFamily: string;
}> = HOMEPAGE_FONT_REGISTRY.map((font) => ({
  label: font.label,
  englishLabel: font.englishLabel,
  value: font.fontKey,
  recommendedUsage: font.recommendedUsage,
  usageHint: font.usageHint,
  previewText: font.previewText,
  cssFontFamily: font.cssFontFamily
}));

export const INLINE_THEME_COLOR_PRESETS = [
  {
    label: "آبی کلاسیک",
    primaryColor: "#1a73e8",
    secondaryColor: "#8c6bff",
    backgroundTint: "#fafcff"
  },
  {
    label: "فیروزه‌ای لوکس",
    primaryColor: "#0f8f83",
    secondaryColor: "#4f6bff",
    backgroundTint: "#f6fffe"
  },
  {
    label: "سرمه‌ای طلایی",
    primaryColor: "#2347b8",
    secondaryColor: "#b88934",
    backgroundTint: "#fbfbff"
  },
  {
    label: "رز تکنولوژی",
    primaryColor: "#c95188",
    secondaryColor: "#697cff",
    backgroundTint: "#fff9fd"
  }
] as const;

export const INLINE_THEME_BUTTON_RADIUS_OPTIONS = [
  { value: "soft", label: "کم", px: 14 },
  { value: "rounded", label: "متوسط", px: 18 },
  { value: "pill", label: "گرد", px: 999 }
] as const;

export const INLINE_THEME_CARD_RADIUS_OPTIONS = [
  { value: "md", label: "متوسط", px: 20 },
  { value: "lg", label: "زیاد", px: 26 },
  { value: "xl", label: "خیلی زیاد", px: 32 }
] as const;

export const INLINE_THEME_CARD_SHADOW_OPTIONS = [
  { value: "soft", label: "ملایم" },
  { value: "medium", label: "معمولی" },
  { value: "strong", label: "پررنگ" }
] as const;

export const INLINE_THEME_DENSITY_OPTIONS = [
  { value: "compact", label: "فشرده", sectionPadding: 56 },
  { value: "normal", label: "معمولی", sectionPadding: 72 },
  { value: "spacious", label: "باز", sectionPadding: 96 }
] as const;

export const INLINE_THEME_BUTTON_STYLE_OPTIONS = [
  { value: "filled", label: "پر" },
  { value: "soft", label: "ملایم" },
  { value: "outline", label: "خطی" }
] as const;

export type InlineTextStyle = {
  fontKey?: HomepageFontKey;
  color?: string;
  fontWeight?: HomepageFontWeight;
};
export type InlineTextStyles<TField extends string = string> = Partial<Record<TField, InlineTextStyle>>;
export type HomepageFieldStyle = InlineTextStyle;
export type HomepageFieldStyles = InlineTextStyles<InlineHomepageTextField>;

export type HomepageLayoutDensity = "compact" | "normal" | "spacious";
export type HomepageProductDensity = "compact" | "normal" | "spacious";
export type HomepageLayoutSettings = {
  hero: {
    density: HomepageLayoutDensity;
    minHeight: number;
    visualHeight: number;
    contentGap: number;
  };
  sections: {
    density: HomepageLayoutDensity;
    paddingY: number;
    maxWidth: number;
  };
  products: {
    density: HomepageProductDensity;
  };
  announcement: {
    density: HomepageLayoutDensity;
    minHeight: number;
  };
  cards: {
    radius: number;
  };
};

export const HOMEPAGE_LAYOUT_PRESETS = {
  hero: {
    compact: { density: "compact", minHeight: 500, visualHeight: 240, contentGap: 22 },
    normal: { density: "normal", minHeight: 560, visualHeight: 290, contentGap: 32 },
    spacious: { density: "spacious", minHeight: 660, visualHeight: 340, contentGap: 42 }
  },
  sections: {
    compact: { density: "compact", paddingY: 52, maxWidth: 1120 },
    normal: { density: "normal", paddingY: 72, maxWidth: 1180 },
    spacious: { density: "spacious", paddingY: 96, maxWidth: 1260 }
  },
  products: {
    compact: { density: "compact" },
    normal: { density: "normal" },
    spacious: { density: "spacious" }
  },
  announcement: {
    compact: { density: "compact", minHeight: 104 },
    normal: { density: "normal", minHeight: 132 },
    spacious: { density: "spacious", minHeight: 172 }
  }
} as const;

export const DEFAULT_HOMEPAGE_LAYOUT_SETTINGS: HomepageLayoutSettings = {
  hero: { ...HOMEPAGE_LAYOUT_PRESETS.hero.normal },
  sections: { ...HOMEPAGE_LAYOUT_PRESETS.sections.normal },
  products: { ...HOMEPAGE_LAYOUT_PRESETS.products.normal },
  announcement: { ...HOMEPAGE_LAYOUT_PRESETS.announcement.normal },
  cards: { radius: 30 }
};

export type InlineThemeButtonRadius = (typeof INLINE_THEME_BUTTON_RADIUS_OPTIONS)[number]["value"];
export type InlineThemeCardRadius = (typeof INLINE_THEME_CARD_RADIUS_OPTIONS)[number]["value"];
export type InlineThemeCardShadow = (typeof INLINE_THEME_CARD_SHADOW_OPTIONS)[number]["value"];
export type InlineThemeButtonStyle = (typeof INLINE_THEME_BUTTON_STYLE_OPTIONS)[number]["value"];

export type InlineThemeValues = {
  primaryColor: string;
  secondaryColor: string;
  backgroundTint: string;
  fontFamily: HomepageFontKey;
  headingFontFamily: HomepageFontKey;
  buttonRadius: InlineThemeButtonRadius;
  cardRadius: InlineThemeCardRadius;
  cardShadow: InlineThemeCardShadow;
  sectionDensity: HomepageLayoutDensity;
  buttonStyle: InlineThemeButtonStyle;
};

export const DEFAULT_INLINE_THEME_VALUES: InlineThemeValues = {
  primaryColor: "#1a73e8",
  secondaryColor: "#8c6bff",
  backgroundTint: "#fafcff",
  fontFamily: INLINE_FONT_DEFAULT_KEY,
  headingFontFamily: INLINE_FONT_DEFAULT_KEY,
  buttonRadius: "pill",
  cardRadius: "lg",
  cardShadow: "medium",
  sectionDensity: "normal",
  buttonStyle: "filled"
};

export const INLINE_THEME_FIELD_KEYS = [
  "primaryColor",
  "secondaryColor",
  "backgroundTint",
  "fontFamily",
  "headingFontFamily",
  "buttonRadius",
  "cardRadius",
  "cardShadow",
  "sectionDensity",
  "buttonStyle"
] as const satisfies ReadonlyArray<keyof InlineThemeValues>;

type InlineThemeRecord = Record<string, unknown>;

type ThemeStyleButtonVars = {
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  buttonShadow: string;
  buttonHoverShadow: string;
};

export function isHexColor(value: string | null | undefined): value is string {
  return Boolean(value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value));
}

function normalizeHex(value: string) {
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  }

  return value.toLowerCase();
}

function normalizeFontToken(value: string) {
  return value.replace(/["']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function mixHexColors(base: string, target: string, weight: number) {
  const start = hexToRgb(normalizeHex(base));
  const end = hexToRgb(normalizeHex(target));
  const safeWeight = Math.max(0, Math.min(1, weight));
  const mixed = {
    r: Math.round(start.r + (end.r - start.r) * safeWeight),
    g: Math.round(start.g + (end.g - start.g) * safeWeight),
    b: Math.round(start.b + (end.b - start.b) * safeWeight)
  };

  return rgbToHex(mixed.r, mixed.g, mixed.b);
}

function hexToRgb(value: string) {
  const hex = normalizeHex(value).slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function getRgbTriplet(value: string) {
  const color = hexToRgb(normalizeHex(value));
  return `${color.r} ${color.g} ${color.b}`;
}

function pickHexColor(value: unknown, fallback: string) {
  return typeof value === "string" && isHexColor(value.trim()) ? normalizeHex(value.trim()) : fallback;
}

function getThemeOptionValue<
  TOptions extends ReadonlyArray<{
    value: string;
  }>
>(value: unknown, options: TOptions, fallback: TOptions[number]["value"]) {
  return typeof value === "string" && options.some((option) => option.value === value)
    ? (value as TOptions[number]["value"])
    : fallback;
}

function getThemeOptionByValue<TOption extends { value: string }>(
  value: string,
  options: ReadonlyArray<TOption>
) {
  return options.find((option) => option.value === value);
}

function getFontOptionByCssFamily(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = normalizeFontToken(value);
  return HOMEPAGE_FONT_REGISTRY.find((font) => normalizeFontToken(font.cssFontFamily) === normalized) || null;
}

export function isInlineHomepageTextField(value: string): value is InlineHomepageTextField {
  return INLINE_HOMEPAGE_TEXT_FIELDS.some((field) => field === value);
}

export function isInlineHomepageImageField(value: string): value is InlineHomepageImageField {
  return INLINE_HOMEPAGE_IMAGE_FIELDS.some((field) => field === value);
}

export function getHomepageFontOption(fontKey: string | null | undefined) {
  return HOMEPAGE_FONT_REGISTRY.find((font) => font.fontKey === fontKey);
}

export function isSafeHomepageFontKey(value: string | null | undefined): value is HomepageFontKey {
  return Boolean(value && getHomepageFontOption(value));
}

export function isSafeHomepageFontWeight(
  fontKey: string | null | undefined,
  weight: string | null | undefined
): weight is HomepageFontWeight {
  if (!weight || (weight !== "400" && weight !== "700")) {
    return false;
  }

  const font = getHomepageFontOption(fontKey);
  return font ? font.allowedWeights.some((allowedWeight) => allowedWeight === weight) : true;
}

export function isSafeInlineFontFamily(value: string | null | undefined): value is HomepageFontKey {
  return isSafeHomepageFontKey(value);
}

export function getInlineFontKeyFallback(
  value: string | null | undefined,
  fallback: HomepageFontKey = DEFAULT_INLINE_THEME_VALUES.fontFamily
): HomepageFontKey {
  if (isSafeHomepageFontKey(value)) {
    return value;
  }

  const legacyFont = getFontOptionByCssFamily(value);
  return legacyFont?.fontKey || fallback;
}

export function getInlineFontFamilyFallback(value: string | null | undefined): string {
  return getHomepageFontOption(getInlineFontKeyFallback(value))?.cssFontFamily || INLINE_FONT_FAMILY_FALLBACK;
}

export function getInlineTextStyleCss(style: InlineTextStyle | null | undefined): CSSProperties {
  const font = getHomepageFontOption(style?.fontKey);

  return {
    ...(font ? { fontFamily: font.cssFontFamily } : {}),
    ...(style?.color && isHexColor(style.color) ? { color: style.color } : {}),
    ...(style?.fontWeight && isSafeHomepageFontWeight(style.fontKey, style.fontWeight)
      ? { fontWeight: style.fontWeight }
      : {})
  };
}

export function getHomepageFieldStyleCss(style: HomepageFieldStyle | null | undefined): CSSProperties {
  return getInlineTextStyleCss(style);
}

export function hasInlineTextStyle(style: InlineTextStyle | null | undefined) {
  return Boolean(style?.fontKey || style?.color || style?.fontWeight);
}

export function hasHomepageFieldStyle(style: HomepageFieldStyle | null | undefined) {
  return hasInlineTextStyle(style);
}

export function normalizeInlineTextStyles<TField extends string>(
  value: unknown,
  allowedFields: readonly TField[]
): InlineTextStyles<TField> | null {
  if (value == null) {
    return {};
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;

  if ("fields" in source) {
    return normalizeInlineTextStyles(source.fields, allowedFields);
  }

  const result: InlineTextStyles<TField> = {};

  for (const [field, rawStyle] of Object.entries(source)) {
    if (!allowedFields.some((allowedField) => allowedField === field)) {
      return null;
    }

    if (rawStyle == null) {
      continue;
    }

    if (typeof rawStyle !== "object" || Array.isArray(rawStyle)) {
      return null;
    }

    const styleSource = rawStyle as Record<string, unknown>;
    const allowedKeys = new Set(["fontKey", "color", "fontWeight"]);

    for (const styleKey of Object.keys(styleSource)) {
      if (!allowedKeys.has(styleKey)) {
        return null;
      }
    }

    const rawFontKey = typeof styleSource.fontKey === "string" ? styleSource.fontKey : undefined;
    const color = typeof styleSource.color === "string" ? styleSource.color.trim() : undefined;
    const rawFontWeight = typeof styleSource.fontWeight === "string" ? styleSource.fontWeight : undefined;

    if (rawFontKey && !isSafeHomepageFontKey(rawFontKey)) {
      return null;
    }

    if (color && !isHexColor(color)) {
      return null;
    }

    if (rawFontWeight && !isSafeHomepageFontWeight(rawFontKey, rawFontWeight)) {
      return null;
    }

    const fontKey = rawFontKey && isSafeHomepageFontKey(rawFontKey) ? rawFontKey : undefined;
    const fontWeight =
      rawFontWeight && isSafeHomepageFontWeight(fontKey, rawFontWeight) ? rawFontWeight : undefined;
    const nextStyle: InlineTextStyle = {
      ...(fontKey ? { fontKey } : {}),
      ...(color ? { color } : {}),
      ...(fontWeight ? { fontWeight } : {})
    };

    if (hasInlineTextStyle(nextStyle)) {
      result[field as TField] = nextStyle;
    }
  }

  return result;
}

export function normalizeHomepageFieldStyles(value: unknown): HomepageFieldStyles | null {
  return normalizeInlineTextStyles(value, INLINE_HOMEPAGE_TEXT_FIELDS) as HomepageFieldStyles | null;
}

function isHomepageLayoutDensity(value: unknown): value is HomepageLayoutDensity {
  return value === "compact" || value === "normal" || value === "spacious";
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function pickDensity(value: unknown, fallback: HomepageLayoutDensity): HomepageLayoutDensity {
  return isHomepageLayoutDensity(value) ? value : fallback;
}

export function normalizeHomepageLayoutSettings(value: unknown): HomepageLayoutSettings | null {
  if (value == null) {
    return DEFAULT_HOMEPAGE_LAYOUT_SETTINGS;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = value as Record<string, unknown>;
  const layoutValue = "layout" in root ? root.layout : value;

  if (layoutValue == null) {
    return DEFAULT_HOMEPAGE_LAYOUT_SETTINGS;
  }

  if (typeof layoutValue !== "object" || Array.isArray(layoutValue)) {
    return null;
  }

  const layout = layoutValue as Record<string, unknown>;
  const hero =
    typeof layout.hero === "object" && layout.hero && !Array.isArray(layout.hero)
      ? (layout.hero as Record<string, unknown>)
      : {};
  const sections =
    typeof layout.sections === "object" && layout.sections && !Array.isArray(layout.sections)
      ? (layout.sections as Record<string, unknown>)
      : {};
  const products =
    typeof layout.products === "object" && layout.products && !Array.isArray(layout.products)
      ? (layout.products as Record<string, unknown>)
      : {};
  const announcement =
    typeof layout.announcement === "object" && layout.announcement && !Array.isArray(layout.announcement)
      ? (layout.announcement as Record<string, unknown>)
      : {};
  const cards =
    typeof layout.cards === "object" && layout.cards && !Array.isArray(layout.cards)
      ? (layout.cards as Record<string, unknown>)
      : {};

  return {
    hero: {
      density: pickDensity(hero.density, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.hero.density),
      minHeight: clampNumber(hero.minHeight, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.hero.minHeight, 440, 780),
      visualHeight: clampNumber(hero.visualHeight, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.hero.visualHeight, 220, 380),
      contentGap: clampNumber(hero.contentGap, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.hero.contentGap, 16, 52)
    },
    sections: {
      density: pickDensity(sections.density, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.sections.density),
      paddingY: clampNumber(sections.paddingY, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.sections.paddingY, 40, 112),
      maxWidth: clampNumber(sections.maxWidth, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.sections.maxWidth, 1040, 1320)
    },
    products: {
      density: pickDensity(products.density, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.products.density)
    },
    announcement: {
      density: pickDensity(announcement.density, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.announcement.density),
      minHeight: clampNumber(
        announcement.minHeight,
        DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.announcement.minHeight,
        88,
        220
      )
    },
    cards: {
      radius: clampNumber(cards.radius, DEFAULT_HOMEPAGE_LAYOUT_SETTINGS.cards.radius, 18, 40)
    }
  };
}

export function getHomepageLayoutStyleCss(layout: HomepageLayoutSettings): CSSProperties {
  return {
    "--homepage-hero-min-height": `${layout.hero.minHeight}px`,
    "--homepage-hero-visual-height": `${layout.hero.visualHeight}px`,
    "--homepage-hero-content-gap": `${layout.hero.contentGap}px`,
    "--homepage-section-padding-y": `${layout.sections.paddingY}px`,
    "--homepage-section-max-width": `${layout.sections.maxWidth}px`,
    "--homepage-announcement-min-height": `${layout.announcement.minHeight}px`,
    "--homepage-card-radius": `${layout.cards.radius}px`
  } as CSSProperties;
}

export function getHomepageLayoutClassNames(layout: HomepageLayoutSettings) {
  return [
    `homepage-layout-hero-${layout.hero.density}`,
    `homepage-layout-sections-${layout.sections.density}`,
    `homepage-layout-products-${layout.products.density}`,
    `homepage-layout-announcement-${layout.announcement.density}`
  ].join(" ");
}

function getCardShadowVariables(level: InlineThemeCardShadow) {
  switch (level) {
    case "soft":
      return {
        base: "0 10px 28px rgba(15, 23, 42, 0.05)",
        hover: "0 16px 34px rgba(15, 23, 42, 0.07)"
      };
    case "strong":
      return {
        base: "0 24px 56px rgba(15, 23, 42, 0.1)",
        hover: "0 32px 72px rgba(15, 23, 42, 0.14)"
      };
    default:
      return {
        base: "0 18px 42px rgba(15, 23, 42, 0.07)",
        hover: "0 24px 52px rgba(15, 23, 42, 0.1)"
      };
  }
}

function getPrimaryButtonVariables(
  style: InlineThemeButtonStyle,
  primaryColor: string,
  secondaryColor: string,
  primaryRgb: string
): ThemeStyleButtonVars {
  if (style === "soft") {
    return {
      buttonBg: `rgb(${primaryRgb} / 0.12)`,
      buttonText: mixHexColors(primaryColor, "#0f172a", 0.18),
      buttonBorder: `rgb(${primaryRgb} / 0.18)`,
      buttonShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
      buttonHoverShadow: "0 18px 28px rgba(15, 23, 42, 0.08)"
    };
  }

  if (style === "outline") {
    return {
      buttonBg: "#ffffff",
      buttonText: mixHexColors(primaryColor, "#0f172a", 0.08),
      buttonBorder: `rgb(${primaryRgb} / 0.3)`,
      buttonShadow: "0 10px 20px rgba(15, 23, 42, 0.04)",
      buttonHoverShadow: "0 16px 26px rgba(15, 23, 42, 0.08)"
    };
  }

  return {
    buttonBg: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    buttonShadow: `0 16px 30px rgb(${primaryRgb} / 0.2)`,
    buttonHoverShadow: `0 20px 36px rgb(${primaryRgb} / 0.24)`
  };
}

export function normalizeInlineThemeValues(
  value: unknown,
  fallback?: Partial<InlineThemeValues>
): InlineThemeValues {
  const defaults: InlineThemeValues = {
    ...DEFAULT_INLINE_THEME_VALUES,
    ...(fallback || {})
  };
  const source =
    typeof value === "object" && value && !Array.isArray(value) ? (value as InlineThemeRecord) : {};

  return {
    primaryColor: pickHexColor(source.primaryColor, defaults.primaryColor),
    secondaryColor: pickHexColor(source.secondaryColor, defaults.secondaryColor),
    backgroundTint: pickHexColor(source.backgroundTint, defaults.backgroundTint),
    fontFamily: getInlineFontKeyFallback(
      typeof source.fontFamily === "string" ? source.fontFamily.trim() : null,
      defaults.fontFamily
    ),
    headingFontFamily: getInlineFontKeyFallback(
      typeof source.headingFontFamily === "string" ? source.headingFontFamily.trim() : null,
      defaults.headingFontFamily
    ),
    buttonRadius: getThemeOptionValue(
      source.buttonRadius,
      INLINE_THEME_BUTTON_RADIUS_OPTIONS,
      defaults.buttonRadius
    ),
    cardRadius: getThemeOptionValue(source.cardRadius, INLINE_THEME_CARD_RADIUS_OPTIONS, defaults.cardRadius),
    cardShadow: getThemeOptionValue(source.cardShadow, INLINE_THEME_CARD_SHADOW_OPTIONS, defaults.cardShadow),
    sectionDensity: getThemeOptionValue(source.sectionDensity, INLINE_THEME_DENSITY_OPTIONS, defaults.sectionDensity),
    buttonStyle: getThemeOptionValue(
      source.buttonStyle,
      INLINE_THEME_BUTTON_STYLE_OPTIONS,
      defaults.buttonStyle
    )
  };
}

export function validateInlineThemeValues(value: unknown): InlineThemeValues | null {
  if (typeof value !== "object" || !value || Array.isArray(value)) {
    return null;
  }

  const source = value as InlineThemeRecord;
  const allowedKeys = new Set([
    "primaryColor",
    "secondaryColor",
    "backgroundTint",
    "fontFamily",
    "headingFontFamily",
    "buttonRadius",
    "cardRadius",
    "cardShadow",
    "sectionDensity",
    "buttonStyle"
  ]);

  for (const key of Object.keys(source)) {
    if (!allowedKeys.has(key)) {
      return null;
    }
  }

  const primaryColor = typeof source.primaryColor === "string" ? source.primaryColor.trim() : "";
  const secondaryColor = typeof source.secondaryColor === "string" ? source.secondaryColor.trim() : "";
  const backgroundTint = typeof source.backgroundTint === "string" ? source.backgroundTint.trim() : "";
  const fontFamily = typeof source.fontFamily === "string" ? source.fontFamily.trim() : "";
  const headingFontFamily = typeof source.headingFontFamily === "string" ? source.headingFontFamily.trim() : "";
  const buttonRadius = typeof source.buttonRadius === "string" ? source.buttonRadius : "";
  const cardRadius = typeof source.cardRadius === "string" ? source.cardRadius : "";
  const cardShadow = typeof source.cardShadow === "string" ? source.cardShadow : "";
  const sectionDensity = typeof source.sectionDensity === "string" ? source.sectionDensity : "";
  const buttonStyle = typeof source.buttonStyle === "string" ? source.buttonStyle : "";

  if (
    !isHexColor(primaryColor) ||
    !isHexColor(secondaryColor) ||
    !isHexColor(backgroundTint) ||
    !isSafeInlineFontFamily(fontFamily) ||
    !isSafeInlineFontFamily(headingFontFamily) ||
    !getThemeOptionByValue(buttonRadius, INLINE_THEME_BUTTON_RADIUS_OPTIONS) ||
    !getThemeOptionByValue(cardRadius, INLINE_THEME_CARD_RADIUS_OPTIONS) ||
    !getThemeOptionByValue(cardShadow, INLINE_THEME_CARD_SHADOW_OPTIONS) ||
    !getThemeOptionByValue(sectionDensity, INLINE_THEME_DENSITY_OPTIONS) ||
    !getThemeOptionByValue(buttonStyle, INLINE_THEME_BUTTON_STYLE_OPTIONS)
  ) {
    return null;
  }

  return {
    primaryColor: normalizeHex(primaryColor),
    secondaryColor: normalizeHex(secondaryColor),
    backgroundTint: normalizeHex(backgroundTint),
    fontFamily,
    headingFontFamily,
    buttonRadius: buttonRadius as InlineThemeButtonRadius,
    cardRadius: cardRadius as InlineThemeCardRadius,
    cardShadow: cardShadow as InlineThemeCardShadow,
    sectionDensity: sectionDensity as HomepageLayoutDensity,
    buttonStyle: buttonStyle as InlineThemeButtonStyle
  };
}

export function buildInlineThemeStyleCss(theme: InlineThemeValues): CSSProperties {
  const normalized = normalizeInlineThemeValues(theme);
  const primaryColor = normalized.primaryColor;
  const secondaryColor = normalized.secondaryColor;
  const backgroundTint = normalized.backgroundTint;
  const primaryRgb = getRgbTriplet(primaryColor);
  const secondaryRgb = getRgbTriplet(secondaryColor);
  const backgroundRgb = getRgbTriplet(backgroundTint);
  const primaryHover = mixHexColors(primaryColor, "#0f172a", 0.14);
  const accentBlue = mixHexColors(primaryColor, "#ffffff", 0.42);
  const accentPurple = mixHexColors(secondaryColor, "#ffffff", 0.26);
  const accentViolet = mixHexColors(secondaryColor, "#ffffff", 0.7);
  const bgCanvas = mixHexColors("#f5f7fb", backgroundTint, 0.36);
  const bgSubtle = mixHexColors("#eef3f9", backgroundTint, 0.58);
  const bgTint = mixHexColors("#fafcff", backgroundTint, 0.82);
  const surfaceRaised = mixHexColors("#fcfdff", backgroundTint, 0.24);
  const surfaceSoft = mixHexColors("#f6f8fc", backgroundTint, 0.4);
  const surfaceMuted = mixHexColors("#f8fafd", backgroundTint, 0.28);
  const panelGradientEnd = mixHexColors("#f9fbff", backgroundTint, 0.62);
  const buttonRadiusPx =
    getThemeOptionByValue(normalized.buttonRadius, INLINE_THEME_BUTTON_RADIUS_OPTIONS)?.px || 18;
  const cardRadiusPx =
    getThemeOptionByValue(normalized.cardRadius, INLINE_THEME_CARD_RADIUS_OPTIONS)?.px || 26;
  const sectionPaddingPx =
    getThemeOptionByValue(normalized.sectionDensity, INLINE_THEME_DENSITY_OPTIONS)?.sectionPadding || 72;
  const buttonVars = getPrimaryButtonVariables(
    normalized.buttonStyle,
    primaryColor,
    secondaryColor,
    primaryRgb
  );
  const cardShadow = getCardShadowVariables(normalized.cardShadow);

  return {
    "--accent-rgb": primaryRgb,
    "--secondary-rgb": secondaryRgb,
    "--background-tint-rgb": backgroundRgb,
    "--color-bg-canvas": bgCanvas,
    "--color-bg-subtle": bgSubtle,
    "--color-bg-tint": bgTint,
    "--color-surface-raised": surfaceRaised,
    "--color-surface-soft": surfaceSoft,
    "--color-surface-muted": `rgb(${getRgbTriplet(surfaceMuted)} / 0.92)`,
    "--color-accent": primaryColor,
    "--color-accent-hover": primaryHover,
    "--color-accent-soft": `rgb(${primaryRgb} / 0.1)`,
    "--color-accent-softer": `rgb(${primaryRgb} / 0.06)`,
    "--primary": primaryColor,
    "--primary-strong": primaryHover,
    "--accent-blue": accentBlue,
    "--accent-purple": accentPurple,
    "--accent-violet": accentViolet,
    "--primary-gradient": `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    "--panel-gradient": `linear-gradient(180deg, rgba(255, 255, 255, 0.98), ${panelGradientEnd})`,
    "--font-ui": getInlineFontFamilyFallback(normalized.fontFamily),
    "--font-heading": getInlineFontFamilyFallback(normalized.headingFontFamily),
    "--theme-button-radius": `${buttonRadiusPx}px`,
    "--theme-card-radius": `${cardRadiusPx}px`,
    "--theme-card-radius-sm": `${Math.max(16, cardRadiusPx - 6)}px`,
    "--theme-card-shadow": cardShadow.base,
    "--theme-card-shadow-hover": cardShadow.hover,
    "--theme-section-padding-y": `${sectionPaddingPx}px`,
    "--theme-primary-button-bg": buttonVars.buttonBg,
    "--theme-primary-button-text": buttonVars.buttonText,
    "--theme-primary-button-border": buttonVars.buttonBorder,
    "--theme-primary-button-shadow": buttonVars.buttonShadow,
    "--theme-primary-button-hover-shadow": buttonVars.buttonHoverShadow
  } as CSSProperties;
}

export function isSafeInlineHref(value: string | null | undefined) {
  const text = value?.trim();

  if (!text) {
    return false;
  }

  return (
    (text.startsWith("/") && !text.startsWith("//")) ||
    /^https?:\/\//i.test(text) ||
    /^mailto:[^\s]+$/i.test(text) ||
    /^tel:[+\d][\d\s-]*$/i.test(text)
  );
}

export function isSafeImageUrl(value: string | null | undefined) {
  const text = value?.trim();
  return Boolean(text && ((text.startsWith("/") && !text.startsWith("//")) || /^https?:\/\//i.test(text)));
}

export function isSafeInlineImageUrl(value: string | null | undefined) {
  const text = value?.trim();
  const allowedHttpsHosts = new Set(["res.cloudinary.com", "images.ctfassets.net", "downloads.ctfassets.net"]);

  if (!text) {
    return false;
  }

  if (text.startsWith("/") && !text.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(text);
    return parsed.protocol === "https:" && allowedHttpsHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function splitTrustPoints(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
