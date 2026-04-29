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
export type InlineHomepageHrefField = (typeof INLINE_HOMEPAGE_HREF_FIELDS)[number];

export type InlineHomepageValues = Record<InlineHomepageTextField, string> &
  Record<InlineHomepageVisibilityField, boolean>;

export const INLINE_FONT_FAMILY_FALLBACK = "\"Vazirmatn\", \"Inter\", system-ui, sans-serif";

export const HOMEPAGE_FONT_REGISTRY = [
  {
    fontKey: "vazirmatn",
    label: "ÙˆØ²ÛŒØ±Ù…ØªÙ†",
    cssFontFamily: INLINE_FONT_FAMILY_FALLBACK,
    recommendedUsage: "body",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "inter",
    label: "Ø§ÛŒÙ†ØªØ±",
    cssFontFamily: "\"Inter\", \"Vazirmatn\", system-ui, sans-serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "notoSansArabic",
    label: "Ù†ÙˆØªÙˆ Ø³Ù†Ø³ Ø¹Ø±Ø¨ÛŒ",
    cssFontFamily: "\"Noto Sans Arabic\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "notoNaskhArabic",
    label: "Ù†ÙˆØªÙˆ Ù†Ø³Ø® Ø¹Ø±Ø¨ÛŒ",
    cssFontFamily: "\"Noto Naskh Arabic\", \"Vazirmatn\", \"Inter\", serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "cairo",
    label: "Ù‚Ø§Ù‡Ø±Ù‡",
    cssFontFamily: "\"Cairo\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "tajawal",
    label: "ØªØ¬ÙˆØ§Ù„",
    cssFontFamily: "\"Tajawal\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "almarai",
    label: "Ø§Ù„Ù…Ø±Ø§Ø¹ÛŒ",
    cssFontFamily: "\"Almarai\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "changa",
    label: "Ú†Ø§Ù†Ú¯Ø§",
    cssFontFamily: "\"Changa\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "display",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "ibmPlexSansArabic",
    label: "IBM Plex Sans Arabic",
    cssFontFamily: "\"IBM Plex Sans Arabic\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "heading",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "markaziText",
    label: "Ù…Ø±Ú©Ø²ÛŒ ØªÚ©Ø³Øª",
    cssFontFamily: "\"Markazi Text\", \"Vazirmatn\", \"Inter\", serif",
    recommendedUsage: "display",
    loaded: true,
    allowedWeights: ["400", "700"]
  },
  {
    fontKey: "lalezar",
    label: "Ù„Ø§Ù„Ù‡â€ŒØ²Ø§Ø±",
    cssFontFamily: "\"Lalezar\", \"Vazirmatn\", \"Inter\", system-ui, sans-serif",
    recommendedUsage: "display",
    loaded: true,
    allowedWeights: ["400"]
  }
] as const;

export type HomepageFontOption = (typeof HOMEPAGE_FONT_REGISTRY)[number];
export type HomepageFontKey = HomepageFontOption["fontKey"];
export type HomepageFontWeight = HomepageFontOption["allowedWeights"][number];
export type HomepageFieldStyle = {
  fontKey?: HomepageFontKey;
  color?: string;
  fontWeight?: HomepageFontWeight;
};
export type HomepageFieldStyles = Partial<Record<InlineHomepageTextField, HomepageFieldStyle>>;

export const INLINE_FONT_OPTIONS = [
  {
    label: "Vazirmatn / Inter",
    value: INLINE_FONT_FAMILY_FALLBACK
  }
] as const;

export type InlineThemeValues = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
};

export function isHexColor(value: string | null | undefined): value is string {
  return Boolean(value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value));
}

export function isInlineHomepageTextField(value: string): value is InlineHomepageTextField {
  return INLINE_HOMEPAGE_TEXT_FIELDS.some((field) => field === value);
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

export function getHomepageFieldStyleCss(style: HomepageFieldStyle | null | undefined): CSSProperties {
  const font = getHomepageFontOption(style?.fontKey);

  return {
    ...(font ? { fontFamily: font.cssFontFamily } : {}),
    ...(style?.color && isHexColor(style.color) ? { color: style.color } : {}),
    ...(style?.fontWeight && isSafeHomepageFontWeight(style.fontKey, style.fontWeight)
      ? { fontWeight: style.fontWeight }
      : {})
  };
}

export function hasHomepageFieldStyle(style: HomepageFieldStyle | null | undefined) {
  return Boolean(style?.fontKey || style?.color || style?.fontWeight);
}

export function normalizeHomepageFieldStyles(value: unknown): HomepageFieldStyles | null {
  if (value == null) {
    return {};
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const result: HomepageFieldStyles = {};

  for (const [field, rawStyle] of Object.entries(source)) {
    if (!isInlineHomepageTextField(field)) {
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
    const nextStyle: HomepageFieldStyle = {
      ...(fontKey ? { fontKey } : {}),
      ...(color ? { color } : {}),
      ...(fontWeight ? { fontWeight } : {})
    };

    if (hasHomepageFieldStyle(nextStyle)) {
      result[field] = nextStyle;
    }
  }

  return result;
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

export function isSafeInlineFontFamily(value: string | null | undefined): value is string {
  return typeof value === "string" && INLINE_FONT_OPTIONS.some((option) => option.value === value);
}

export function getInlineFontFamilyFallback(value: string | null | undefined): string {
  return isSafeInlineFontFamily(value) ? value : INLINE_FONT_FAMILY_FALLBACK;
}

export function splitTrustPoints(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}


