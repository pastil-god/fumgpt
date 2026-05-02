import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { homePageContent as fallbackHomePageContent, type HomePageContent } from "@/lib/mock-homepage";
import {
  DEFAULT_HEADER_DISPLAY_SETTINGS,
  HEADER_CONTAINER_WIDTH_OPTIONS,
  HEADER_LAYOUT_SIZE_OPTIONS,
  fallbackStorefrontSettings,
  type HeaderContainerWidth,
  type HeaderDisplaySettings,
  type HeaderLayoutSize,
  type StorefrontSettings
} from "@/lib/site";
import {
  DEFAULT_INLINE_THEME_VALUES,
  getInlineFontKeyFallback,
  normalizeHomepageCustomBlocks,
  normalizeHomepageLayoutSettings,
  normalizeHomepageFieldStyles,
  normalizeInlineThemeValues,
  isHexColor,
  isSafeImageUrl,
  isSafeInlineImageUrl,
  isSafeInlineHref,
  type InlineTextStyles,
  type HomepageLayoutSettings,
  type HomepageFieldStyles,
  type HomepageCustomBlock,
  type InlineHomepageValues,
  type InlineThemeValues
} from "@/lib/settings/inline-homepage";
import {
  DEFAULT_INLINE_PRODUCTS_PAGE_VALUES,
  normalizeInlineProductsPageFieldStyles,
  normalizeInlineProductsPageValues,
  type InlineProductsPageFieldStyles,
  type InlineProductsPageValues
} from "@/lib/settings/inline-products";

export const SITE_SETTINGS_ID = "main";
export const HOMEPAGE_SETTINGS_ID = "main";
export const PAGE_SETTINGS_PRODUCTS_SLUG = "products";

function cleanString(value: FormDataEntryValue | string | null | undefined) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function cleanSafeHref(value: FormDataEntryValue | string | null | undefined) {
  const text = cleanString(value);
  return isSafeInlineHref(text) ? text : null;
}

function cleanSafeImageUrl(value: FormDataEntryValue | string | null | undefined) {
  const text = cleanString(value);
  return isSafeImageUrl(text) ? text : null;
}

function cleanSafeInlineImageUrl(value: FormDataEntryValue | string | null | undefined) {
  const text = cleanString(value);
  return isSafeInlineImageUrl(text) ? text : null;
}

function cleanHexColor(value: FormDataEntryValue | string | null | undefined) {
  const text = cleanString(value);
  return isHexColor(text) ? text : null;
}

function cleanFontFamily(value: FormDataEntryValue | string | null | undefined) {
  return getInlineFontKeyFallback(cleanString(value));
}

function getAppearanceInput(
  source: Record<string, unknown> | null | undefined,
  base: InlineThemeValues
): InlineThemeValues {
  return normalizeInlineThemeValues(
    {
      primaryColor: typeof source?.primaryColor === "string" ? source.primaryColor : undefined,
      secondaryColor: typeof source?.secondaryColor === "string" ? source.secondaryColor : undefined,
      backgroundTint: typeof source?.backgroundTint === "string" ? source.backgroundTint : undefined,
      fontFamily: typeof source?.fontFamily === "string" ? source.fontFamily : undefined,
      headingFontFamily: typeof source?.headingFontFamily === "string" ? source.headingFontFamily : undefined,
      buttonRadius: typeof source?.buttonRadius === "string" ? source.buttonRadius : undefined,
      cardRadius: typeof source?.cardRadius === "string" ? source.cardRadius : undefined,
      cardShadow: typeof source?.cardShadow === "string" ? source.cardShadow : undefined,
      sectionDensity: typeof source?.sectionDensity === "string" ? source.sectionDensity : undefined,
      buttonStyle: typeof source?.buttonStyle === "string" ? source.buttonStyle : undefined
    },
    base
  );
}

function isHeaderLayoutSize(value: unknown): value is HeaderLayoutSize {
  return typeof value === "string" && HEADER_LAYOUT_SIZE_OPTIONS.some((option) => option === value);
}

function isHeaderContainerWidth(value: unknown): value is HeaderContainerWidth {
  return typeof value === "string" && HEADER_CONTAINER_WIDTH_OPTIONS.some((option) => option === value);
}

function pickBoolean(source: Record<string, unknown> | null | undefined, key: string, fallback: boolean) {
  const value = source?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function pickHeaderLayoutSize(
  source: Record<string, unknown> | null | undefined,
  key: string,
  fallback: HeaderLayoutSize
) {
  const value = source?.[key];
  return isHeaderLayoutSize(value) ? value : fallback;
}

function pickHeaderContainerWidth(
  source: Record<string, unknown> | null | undefined,
  key: string,
  fallback: HeaderContainerWidth
) {
  const value = source?.[key];
  return isHeaderContainerWidth(value) ? value : fallback;
}

function cleanHeaderLayoutSize(value: FormDataEntryValue | string | null | undefined) {
  const text = cleanString(value);
  return isHeaderLayoutSize(text) ? text : DEFAULT_HEADER_DISPLAY_SETTINGS.topBarSize;
}

function cleanHeaderContainerWidth(value: FormDataEntryValue | string | null | undefined) {
  const text = cleanString(value);
  return isHeaderContainerWidth(text) ? text : DEFAULT_HEADER_DISPLAY_SETTINGS.headerContainerWidth;
}

export function normalizeHeaderDisplaySettings(
  source: Record<string, unknown> | null | undefined,
  base: HeaderDisplaySettings = DEFAULT_HEADER_DISPLAY_SETTINGS
): HeaderDisplaySettings {
  return {
    showTopBar: pickBoolean(source, "showTopBar", base.showTopBar),
    showTopBarText: pickBoolean(source, "showTopBarText", base.showTopBarText),
    showTopBarHighlights: pickBoolean(source, "showTopBarHighlights", base.showTopBarHighlights),
    showSupportPhone: pickBoolean(source, "showSupportPhone", base.showSupportPhone),
    showSupportEmail: pickBoolean(source, "showSupportEmail", base.showSupportEmail),
    showMainNavigation: pickBoolean(source, "showMainNavigation", base.showMainNavigation),
    showHeaderActions: pickBoolean(source, "showHeaderActions", base.showHeaderActions),
    showAccountButton: pickBoolean(source, "showAccountButton", base.showAccountButton),
    showCartButton: pickBoolean(source, "showCartButton", base.showCartButton),
    topBarSize: pickHeaderLayoutSize(source, "topBarSize", base.topBarSize),
    headerSize: pickHeaderLayoutSize(source, "headerSize", base.headerSize),
    headerContainerWidth: pickHeaderContainerWidth(source, "headerContainerWidth", base.headerContainerWidth)
  };
}

function pickText(source: Record<string, unknown> | null | undefined, key: string, fallback: string) {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function pickOptionalText(source: Record<string, unknown> | null | undefined, key: string, fallback?: string) {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function splitLines(value: string | null | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  const items = value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

function pickHexColor(value: string | null | undefined, fallback: string) {
  return isHexColor(value) && value ? value : fallback;
}

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export const getStoredSiteSettings = cache(async () => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    return await prisma.siteSetting.findUnique({ where: { id: SITE_SETTINGS_ID } });
  } catch (error) {
    console.warn("Site settings fallback: database settings could not be loaded", error);
    return null;
  }
});

export const getStoredHomepageSettings = cache(async () => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    return await prisma.homepageSetting.findUnique({ where: { id: HOMEPAGE_SETTINGS_ID } });
  } catch (error) {
    console.warn("Homepage settings fallback: database settings could not be loaded", error);
    return null;
  }
});

export const getStoredPageSetting = cache(async (slug: string) => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    return await prisma.pageSetting.findUnique({ where: { slug } });
  } catch (error) {
    console.warn(`Page settings fallback: settings for "${slug}" could not be loaded`, error);
    return null;
  }
});

export const getHomepageStyleSettings = cache(async (): Promise<HomepageFieldStyles> => {
  const settings = await getStoredHomepageSettings();
  return normalizeStoredHomepageFieldStyles(settings?.homepageFieldStyles);
});

export const getHomepageLayoutSettings = cache(async (): Promise<HomepageLayoutSettings> => {
  const settings = await getStoredHomepageSettings();
  return normalizeStoredHomepageLayoutSettings(settings?.homepageFieldStyles);
});

export const getHomepageCustomBlocksSettings = cache(async (): Promise<HomepageCustomBlock[]> => {
  const settings = await getStoredHomepageSettings();
  return normalizeHomepageCustomBlocks(settings?.homepageFieldStyles);
});

function normalizeStoredHomepageFieldStyles(value: unknown): HomepageFieldStyles {
  return normalizeHomepageFieldStyles(value) || {};
}

function normalizeStoredHomepageLayoutSettings(value: unknown): HomepageLayoutSettings {
  return normalizeHomepageLayoutSettings(value) || normalizeHomepageLayoutSettings(null)!;
}

function serializeHomepageInlineDesignSettings(
  fieldStyles: HomepageFieldStyles,
  layout: HomepageLayoutSettings,
  blocks: HomepageCustomBlock[]
) {
  return JSON.parse(
    JSON.stringify({
      fields: fieldStyles,
      layout,
      blocks
    })
  ) as Prisma.InputJsonValue;
}

function serializeInlineTextStyles(fieldStyles: InlineTextStyles<string>) {
  return JSON.parse(JSON.stringify(fieldStyles)) as Prisma.InputJsonValue;
}

export function mergeStorefrontSettings(
  base: StorefrontSettings,
  settings: Awaited<ReturnType<typeof getStoredSiteSettings>>
): StorefrontSettings {
  if (!settings) {
    return base;
  }

  return {
    ...base,
    brandName: pickText(settings, "siteTitle", base.brandName),
    siteTitle: pickText(settings, "defaultSeoTitle", settings.siteTitle || base.siteTitle),
    siteDescription: pickText(settings, "defaultSeoDescription", settings.metaDescription || base.siteDescription),
    brandTagline: pickText(settings, "tagline", base.brandTagline),
    logoUrl: pickOptionalText(settings, "logoUrl", base.logoUrl),
    faviconUrl: pickOptionalText(settings, "faviconUrl", base.faviconUrl),
    support: {
      ...base.support,
      phone: pickText(settings, "contactPhone", base.support.phone),
      email: pickText(settings, "contactEmail", base.support.email),
      address: pickText(settings, "contactAddress", base.support.address),
      helpCtaLabel: pickText(settings, "supportCtaLabel", base.support.helpCtaLabel),
      helpCtaHref: pickText(settings, "supportCtaHref", base.support.helpCtaHref)
    },
    socials: {
      telegram: pickText(settings, "telegramUrl", base.socials.telegram),
      instagram: pickText(settings, "instagramUrl", base.socials.instagram),
      whatsapp: pickText(settings, "whatsappUrl", base.socials.whatsapp)
    },
    footer: {
      description: pickText(settings, "footerText", base.footer.description),
      copyright: base.footer.copyright
    },
    appearance: getAppearanceInput(settings, base.appearance),
    header: normalizeHeaderDisplaySettings(settings, base.header)
  };
}

export function mergeHomepageContent(
  base: HomePageContent,
  settings: Awaited<ReturnType<typeof getStoredHomepageSettings>>
): HomePageContent {
  if (!settings) {
    return base;
  }

  return {
    hero: {
      eyebrow: pickText(settings, "heroEyebrow", base.hero.eyebrow),
      statusLabel: pickText(settings, "heroStatusLabel", base.hero.statusLabel),
      titleLead: pickText(settings, "heroTitleLead", base.hero.titleLead),
      titleHighlight: pickText(settings, "heroTitleHighlight", base.hero.titleHighlight),
      titleTail: pickText(settings, "heroTitleTail", base.hero.titleTail),
      description: pickText(settings, "heroDescription", base.hero.description),
      primaryCtaLabel: pickText(settings, "heroPrimaryCtaLabel", base.hero.primaryCtaLabel),
      primaryCtaHref: pickText(settings, "heroPrimaryCtaHref", base.hero.primaryCtaHref),
      secondaryCtaLabel: pickText(settings, "heroSecondaryCtaLabel", base.hero.secondaryCtaLabel),
      secondaryCtaHref: pickText(settings, "heroSecondaryCtaHref", base.hero.secondaryCtaHref),
      proofTitle: pickText(settings, "heroProofTitle", base.hero.proofTitle),
      proofText: pickText(settings, "heroProofText", base.hero.proofText),
      quickStartTitle: pickText(settings, "heroQuickStartTitle", base.hero.quickStartTitle),
      quickStartText: pickText(settings, "heroQuickStartText", base.hero.quickStartText),
      marketLabel: pickText(settings, "heroMarketLabel", base.hero.marketLabel),
      marketTitle: pickText(settings, "heroMarketTitle", base.hero.marketTitle),
      marketDescription: pickText(settings, "heroMarketDescription", base.hero.marketDescription),
      marketBadge: pickText(settings, "heroMarketBadge", base.hero.marketBadge),
      imageUrl: pickOptionalText(settings, "heroImageUrl", base.hero.imageUrl)
    },
    categorySection: {
      isVisible: settings.showCategorySection,
      eyebrow: pickText(settings, "categoriesEyebrow", base.categorySection.eyebrow),
      title: pickText(settings, "categoriesTitle", base.categorySection.title),
      description: pickText(settings, "categoriesDescription", base.categorySection.description),
      ctaLabel: pickText(settings, "categoriesCtaLabel", base.categorySection.ctaLabel),
      ctaHref: pickText(settings, "categoriesCtaHref", base.categorySection.ctaHref)
    },
    featuredSection: {
      isVisible: settings.showFeaturedSection,
      eyebrow: pickText(settings, "featuredEyebrow", base.featuredSection.eyebrow),
      title: pickText(settings, "featuredTitle", base.featuredSection.title),
      description: pickText(settings, "featuredDescription", base.featuredSection.description),
      ctaLabel: pickText(settings, "featuredCtaLabel", base.featuredSection.ctaLabel),
      ctaHref: pickText(settings, "featuredCtaHref", base.featuredSection.ctaHref)
    },
    newsSection: {
      ...base.newsSection,
      isVisible: settings.showNewsSection,
      eyebrow: pickText(settings, "newsEyebrow", base.newsSection.eyebrow),
      title: pickText(settings, "newsTitle", base.newsSection.title),
      description: pickText(settings, "newsDescription", base.newsSection.description),
      ctaLabel: pickText(settings, "newsCtaLabel", base.newsSection.ctaLabel),
      ctaHref: pickText(settings, "newsCtaHref", base.newsSection.ctaHref)
    },
    trustSection: {
      isVisible: settings.showTrustSection,
      eyebrow: pickText(settings, "trustEyebrow", base.trustSection.eyebrow),
      title: pickText(settings, "trustTitle", base.trustSection.title),
      points: splitLines(settings.trustPoints, base.trustSection.points)
    },
    roadmapSection: {
      isVisible: settings.showRoadmapSection,
      eyebrow: pickText(settings, "roadmapEyebrow", base.roadmapSection.eyebrow),
      title: pickText(settings, "roadmapTitle", base.roadmapSection.title),
      phases: [
        {
          title: pickText(settings, "roadmapPhase1Title", base.roadmapSection.phases[0].title),
          description: pickText(settings, "roadmapPhase1Description", base.roadmapSection.phases[0].description)
        },
        {
          title: pickText(settings, "roadmapPhase2Title", base.roadmapSection.phases[1].title),
          description: pickText(settings, "roadmapPhase2Description", base.roadmapSection.phases[1].description)
        },
        {
          title: pickText(settings, "roadmapPhase3Title", base.roadmapSection.phases[2].title),
          description: pickText(settings, "roadmapPhase3Description", base.roadmapSection.phases[2].description)
        }
      ]
    },
    announcement: {
      isVisible: settings.showAnnouncement,
      label: pickText(settings, "announcementLabel", base.announcement.label),
      title: pickText(settings, "announcementTitle", base.announcement.title),
      description: pickText(settings, "announcementDescription", base.announcement.description),
      ctaLabel: pickText(settings, "announcementCtaLabel", base.announcement.ctaLabel),
      ctaHref: pickText(settings, "announcementCtaHref", base.announcement.ctaHref)
    }
  };
}

export function getEditableSiteSettingsDefaults(settings: Awaited<ReturnType<typeof getStoredSiteSettings>>) {
  const merged = mergeStorefrontSettings(fallbackStorefrontSettings, settings);
  const header = normalizeHeaderDisplaySettings(settings, merged.header);

  return {
    siteTitle: settings?.siteTitle || merged.brandName,
    tagline: settings?.tagline || merged.brandTagline,
    metaDescription: settings?.metaDescription || merged.siteDescription,
    logoUrl: settings?.logoUrl || merged.logoUrl || "",
    faviconUrl: settings?.faviconUrl || "",
    primaryColor: merged.appearance.primaryColor,
    secondaryColor: merged.appearance.secondaryColor,
    backgroundTint: merged.appearance.backgroundTint,
    fontFamily: merged.appearance.fontFamily,
    headingFontFamily: merged.appearance.headingFontFamily,
    buttonRadius: merged.appearance.buttonRadius,
    cardRadius: merged.appearance.cardRadius,
    cardShadow: merged.appearance.cardShadow,
    sectionDensity: merged.appearance.sectionDensity,
    buttonStyle: merged.appearance.buttonStyle,
    footerText: settings?.footerText || merged.footer.description,
    contactPhone: settings?.contactPhone || merged.support.phone,
    contactEmail: settings?.contactEmail || merged.support.email,
    contactAddress: settings?.contactAddress || merged.support.address,
    supportCtaLabel: settings?.supportCtaLabel || merged.support.helpCtaLabel,
    supportCtaHref: settings?.supportCtaHref || merged.support.helpCtaHref,
    telegramUrl: settings?.telegramUrl || merged.socials.telegram,
    instagramUrl: settings?.instagramUrl || merged.socials.instagram,
    whatsappUrl: settings?.whatsappUrl || merged.socials.whatsapp,
    defaultSeoTitle: settings?.defaultSeoTitle || merged.siteTitle,
    defaultSeoDescription: settings?.defaultSeoDescription || merged.siteDescription,
    showTopBar: header.showTopBar,
    showTopBarText: header.showTopBarText,
    showTopBarHighlights: header.showTopBarHighlights,
    showSupportPhone: header.showSupportPhone,
    showSupportEmail: header.showSupportEmail,
    showMainNavigation: header.showMainNavigation,
    showHeaderActions: header.showHeaderActions,
    showAccountButton: header.showAccountButton,
    showCartButton: header.showCartButton,
    topBarSize: header.topBarSize,
    headerSize: header.headerSize,
    headerContainerWidth: header.headerContainerWidth
  };
}

export function getEditableHomepageSettingsDefaults(settings: Awaited<ReturnType<typeof getStoredHomepageSettings>>) {
  return mergeHomepageContent(fallbackHomePageContent, settings);
}

export async function getProductsPageInlineSettings() {
  const settings = await getStoredPageSetting(PAGE_SETTINGS_PRODUCTS_SLUG);
  const contentSource =
    typeof settings?.content === "object" && settings?.content && !Array.isArray(settings.content)
      ? (settings.content as Record<string, unknown>)
      : {};

  return {
    content: normalizeInlineProductsPageValues(
      {
        pageTitle: settings?.title || undefined,
        pageDescription: settings?.description || undefined,
        ...contentSource
      },
      DEFAULT_INLINE_PRODUCTS_PAGE_VALUES
    ),
    fieldStyles: normalizeInlineProductsPageFieldStyles(settings?.fieldStyles) || {}
  };
}

export function getAppearanceAuditDetails(settings: unknown) {
  const appearance = normalizeInlineThemeValues(settings, DEFAULT_INLINE_THEME_VALUES);

  return {
    primaryColor: appearance.primaryColor,
    secondaryColor: appearance.secondaryColor,
    backgroundTint: appearance.backgroundTint,
    fontFamily: appearance.fontFamily,
    headingFontFamily: appearance.headingFontFamily,
    buttonRadius: appearance.buttonRadius,
    cardRadius: appearance.cardRadius,
    cardShadow: appearance.cardShadow,
    sectionDensity: appearance.sectionDensity,
    buttonStyle: appearance.buttonStyle
  } satisfies InlineThemeValues;
}

export async function saveSiteSettingsFromForm(formData: FormData, updatedById: string) {
  const currentSettings = await getStoredSiteSettings();
  const mergedAppearance = getAppearanceInput(currentSettings, fallbackStorefrontSettings.appearance);
  const appearance = normalizeInlineThemeValues(
    {
      primaryColor: cleanHexColor(formData.get("primaryColor")),
      secondaryColor: cleanHexColor(formData.get("secondaryColor")),
      backgroundTint: cleanHexColor(formData.get("backgroundTint")),
      fontFamily: cleanFontFamily(formData.get("fontFamily")),
      headingFontFamily: cleanFontFamily(formData.get("headingFontFamily")),
      buttonRadius: cleanString(formData.get("buttonRadius")),
      cardRadius: cleanString(formData.get("cardRadius")),
      cardShadow: cleanString(formData.get("cardShadow")),
      sectionDensity: cleanString(formData.get("sectionDensity")),
      buttonStyle: cleanString(formData.get("buttonStyle"))
    },
    mergedAppearance
  );
  const data = {
    siteTitle: cleanString(formData.get("siteTitle")),
    tagline: cleanString(formData.get("tagline")),
    metaDescription: cleanString(formData.get("metaDescription")),
    logoUrl: cleanSafeImageUrl(formData.get("logoUrl")),
    faviconUrl: cleanSafeImageUrl(formData.get("faviconUrl")),
    primaryColor: appearance.primaryColor,
    secondaryColor: appearance.secondaryColor,
    backgroundTint: appearance.backgroundTint,
    fontFamily: appearance.fontFamily,
    headingFontFamily: appearance.headingFontFamily,
    buttonRadius: appearance.buttonRadius,
    cardRadius: appearance.cardRadius,
    cardShadow: appearance.cardShadow,
    sectionDensity: appearance.sectionDensity,
    buttonStyle: appearance.buttonStyle,
    footerText: cleanString(formData.get("footerText")),
    contactPhone: cleanString(formData.get("contactPhone")),
    contactEmail: cleanString(formData.get("contactEmail")),
    contactAddress: cleanString(formData.get("contactAddress")),
    supportCtaLabel: cleanString(formData.get("supportCtaLabel")),
    supportCtaHref: cleanSafeHref(formData.get("supportCtaHref")),
    telegramUrl: cleanSafeHref(formData.get("telegramUrl")),
    instagramUrl: cleanSafeHref(formData.get("instagramUrl")),
    whatsappUrl: cleanSafeHref(formData.get("whatsappUrl")),
    defaultSeoTitle: cleanString(formData.get("defaultSeoTitle")),
    defaultSeoDescription: cleanString(formData.get("defaultSeoDescription")),
    showTopBar: formData.get("showTopBar") === "on",
    showTopBarText: formData.get("showTopBarText") === "on",
    showTopBarHighlights: formData.get("showTopBarHighlights") === "on",
    showSupportPhone: formData.get("showSupportPhone") === "on",
    showSupportEmail: formData.get("showSupportEmail") === "on",
    showMainNavigation: formData.get("showMainNavigation") === "on",
    showHeaderActions: formData.get("showHeaderActions") === "on",
    showAccountButton: formData.get("showAccountButton") === "on",
    showCartButton: formData.get("showCartButton") === "on",
    topBarSize: cleanHeaderLayoutSize(formData.get("topBarSize")),
    headerSize: cleanHeaderLayoutSize(formData.get("headerSize")),
    headerContainerWidth: cleanHeaderContainerWidth(formData.get("headerContainerWidth")),
    updatedById
  };

  return prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { id: SITE_SETTINGS_ID, ...data },
    update: data
  });
}

export async function saveInlineSiteAppearanceSettings(settings: InlineThemeValues, updatedById: string) {
  const appearance = getAppearanceAuditDetails(settings);
  const data = {
    primaryColor: appearance.primaryColor,
    secondaryColor: appearance.secondaryColor,
    backgroundTint: appearance.backgroundTint,
    fontFamily: appearance.fontFamily,
    headingFontFamily: appearance.headingFontFamily,
    buttonRadius: appearance.buttonRadius,
    cardRadius: appearance.cardRadius,
    cardShadow: appearance.cardShadow,
    sectionDensity: appearance.sectionDensity,
    buttonStyle: appearance.buttonStyle,
    updatedById
  };

  return prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { id: SITE_SETTINGS_ID, ...data },
    update: data
  });
}

export async function saveProductsPageInlineSettings(
  content: InlineProductsPageValues,
  updatedById: string,
  fieldStyles?: InlineProductsPageFieldStyles
) {
  const safeContent = normalizeInlineProductsPageValues(content, DEFAULT_INLINE_PRODUCTS_PAGE_VALUES);
  const safeFieldStyles = fieldStyles || {};
  const data = {
    title: safeContent.pageTitle,
    description: safeContent.pageDescription,
    content: JSON.parse(JSON.stringify(safeContent)) as Prisma.InputJsonValue,
    fieldStyles: serializeInlineTextStyles(safeFieldStyles as InlineTextStyles<string>),
    updatedById
  };

  return prisma.pageSetting.upsert({
    where: { slug: PAGE_SETTINGS_PRODUCTS_SLUG },
    create: {
      id: PAGE_SETTINGS_PRODUCTS_SLUG,
      slug: PAGE_SETTINGS_PRODUCTS_SLUG,
      ...data
    },
    update: data
  });
}

export async function saveHomepageSettingsFromForm(formData: FormData, updatedById: string) {
  const data = {
    heroEyebrow: cleanString(formData.get("heroEyebrow")),
    heroStatusLabel: cleanString(formData.get("heroStatusLabel")),
    heroTitleLead: cleanString(formData.get("heroTitleLead")),
    heroTitleHighlight: cleanString(formData.get("heroTitleHighlight")),
    heroTitleTail: cleanString(formData.get("heroTitleTail")),
    heroDescription: cleanString(formData.get("heroDescription")),
    heroPrimaryCtaLabel: cleanString(formData.get("heroPrimaryCtaLabel")),
    heroPrimaryCtaHref: cleanSafeHref(formData.get("heroPrimaryCtaHref")),
    heroSecondaryCtaLabel: cleanString(formData.get("heroSecondaryCtaLabel")),
    heroSecondaryCtaHref: cleanSafeHref(formData.get("heroSecondaryCtaHref")),
    heroProofTitle: cleanString(formData.get("heroProofTitle")),
    heroProofText: cleanString(formData.get("heroProofText")),
    heroQuickStartTitle: cleanString(formData.get("heroQuickStartTitle")),
    heroQuickStartText: cleanString(formData.get("heroQuickStartText")),
    heroMarketLabel: cleanString(formData.get("heroMarketLabel")),
    heroMarketTitle: cleanString(formData.get("heroMarketTitle")),
    heroMarketDescription: cleanString(formData.get("heroMarketDescription")),
    heroMarketBadge: cleanString(formData.get("heroMarketBadge")),
    heroImageUrl: cleanSafeInlineImageUrl(formData.get("heroImageUrl")),
    showCategorySection: formData.get("showCategorySection") === "on",
    categoriesEyebrow: cleanString(formData.get("categoriesEyebrow")),
    categoriesTitle: cleanString(formData.get("categoriesTitle")),
    categoriesDescription: cleanString(formData.get("categoriesDescription")),
    categoriesCtaLabel: cleanString(formData.get("categoriesCtaLabel")),
    categoriesCtaHref: cleanSafeHref(formData.get("categoriesCtaHref")),
    showFeaturedSection: formData.get("showFeaturedSection") === "on",
    featuredEyebrow: cleanString(formData.get("featuredEyebrow")),
    featuredTitle: cleanString(formData.get("featuredTitle")),
    featuredDescription: cleanString(formData.get("featuredDescription")),
    featuredCtaLabel: cleanString(formData.get("featuredCtaLabel")),
    featuredCtaHref: cleanSafeHref(formData.get("featuredCtaHref")),
    showNewsSection: formData.get("showNewsSection") === "on",
    newsEyebrow: cleanString(formData.get("newsEyebrow")),
    newsTitle: cleanString(formData.get("newsTitle")),
    newsDescription: cleanString(formData.get("newsDescription")),
    newsCtaLabel: cleanString(formData.get("newsCtaLabel")),
    newsCtaHref: cleanSafeHref(formData.get("newsCtaHref")),
    showTrustSection: formData.get("showTrustSection") === "on",
    trustEyebrow: cleanString(formData.get("trustEyebrow")),
    trustTitle: cleanString(formData.get("trustTitle")),
    trustPoints: cleanString(formData.get("trustPoints")),
    showRoadmapSection: formData.get("showRoadmapSection") === "on",
    roadmapEyebrow: cleanString(formData.get("roadmapEyebrow")),
    roadmapTitle: cleanString(formData.get("roadmapTitle")),
    roadmapPhase1Title: cleanString(formData.get("roadmapPhase1Title")),
    roadmapPhase1Description: cleanString(formData.get("roadmapPhase1Description")),
    roadmapPhase2Title: cleanString(formData.get("roadmapPhase2Title")),
    roadmapPhase2Description: cleanString(formData.get("roadmapPhase2Description")),
    roadmapPhase3Title: cleanString(formData.get("roadmapPhase3Title")),
    roadmapPhase3Description: cleanString(formData.get("roadmapPhase3Description")),
    showAnnouncement: formData.get("showAnnouncement") === "on",
    announcementLabel: cleanString(formData.get("announcementLabel")),
    announcementTitle: cleanString(formData.get("announcementTitle")),
    announcementDescription: cleanString(formData.get("announcementDescription")),
    announcementCtaLabel: cleanString(formData.get("announcementCtaLabel")),
    announcementCtaHref: cleanSafeHref(formData.get("announcementCtaHref")),
    updatedById
  };

  return prisma.homepageSetting.upsert({
    where: { id: HOMEPAGE_SETTINGS_ID },
    create: { id: HOMEPAGE_SETTINGS_ID, ...data },
    update: data
  });
}

export async function saveInlineHomepageSettings(
  settings: InlineHomepageValues,
  updatedById: string,
  fieldStyles?: HomepageFieldStyles,
  layoutSettings?: HomepageLayoutSettings,
  customBlocks?: HomepageCustomBlock[]
) {
  const safeFieldStyles = fieldStyles || {};
  const safeLayoutSettings = layoutSettings || normalizeStoredHomepageLayoutSettings(null);
  const safeCustomBlocks = customBlocks || [];
  const data = {
    heroEyebrow: cleanString(settings.heroEyebrow),
    heroStatusLabel: cleanString(settings.heroStatusLabel),
    heroTitleLead: cleanString(settings.heroTitleLead),
    heroTitleHighlight: cleanString(settings.heroTitleHighlight),
    heroTitleTail: cleanString(settings.heroTitleTail),
    heroDescription: cleanString(settings.heroDescription),
    heroPrimaryCtaLabel: cleanString(settings.heroPrimaryCtaLabel),
    heroPrimaryCtaHref: cleanString(settings.heroPrimaryCtaHref),
    heroSecondaryCtaLabel: cleanString(settings.heroSecondaryCtaLabel),
    heroSecondaryCtaHref: cleanString(settings.heroSecondaryCtaHref),
    heroProofTitle: cleanString(settings.heroProofTitle),
    heroProofText: cleanString(settings.heroProofText),
    heroQuickStartTitle: cleanString(settings.heroQuickStartTitle),
    heroQuickStartText: cleanString(settings.heroQuickStartText),
    heroMarketLabel: cleanString(settings.heroMarketLabel),
    heroMarketTitle: cleanString(settings.heroMarketTitle),
    heroMarketDescription: cleanString(settings.heroMarketDescription),
    heroMarketBadge: cleanString(settings.heroMarketBadge),
    heroImageUrl: cleanSafeInlineImageUrl(settings.heroImageUrl),
    showCategorySection: settings.showCategorySection,
    categoriesEyebrow: cleanString(settings.categoriesEyebrow),
    categoriesTitle: cleanString(settings.categoriesTitle),
    categoriesDescription: cleanString(settings.categoriesDescription),
    categoriesCtaLabel: cleanString(settings.categoriesCtaLabel),
    categoriesCtaHref: cleanString(settings.categoriesCtaHref),
    showFeaturedSection: settings.showFeaturedSection,
    featuredEyebrow: cleanString(settings.featuredEyebrow),
    featuredTitle: cleanString(settings.featuredTitle),
    featuredDescription: cleanString(settings.featuredDescription),
    featuredCtaLabel: cleanString(settings.featuredCtaLabel),
    featuredCtaHref: cleanString(settings.featuredCtaHref),
    showNewsSection: settings.showNewsSection,
    newsEyebrow: cleanString(settings.newsEyebrow),
    newsTitle: cleanString(settings.newsTitle),
    newsDescription: cleanString(settings.newsDescription),
    newsCtaLabel: cleanString(settings.newsCtaLabel),
    newsCtaHref: cleanString(settings.newsCtaHref),
    showTrustSection: settings.showTrustSection,
    trustEyebrow: cleanString(settings.trustEyebrow),
    trustTitle: cleanString(settings.trustTitle),
    trustPoints: cleanString(settings.trustPoints),
    showRoadmapSection: settings.showRoadmapSection,
    roadmapEyebrow: cleanString(settings.roadmapEyebrow),
    roadmapTitle: cleanString(settings.roadmapTitle),
    roadmapPhase1Title: cleanString(settings.roadmapPhase1Title),
    roadmapPhase1Description: cleanString(settings.roadmapPhase1Description),
    roadmapPhase2Title: cleanString(settings.roadmapPhase2Title),
    roadmapPhase2Description: cleanString(settings.roadmapPhase2Description),
    roadmapPhase3Title: cleanString(settings.roadmapPhase3Title),
    roadmapPhase3Description: cleanString(settings.roadmapPhase3Description),
    showAnnouncement: settings.showAnnouncement,
    announcementLabel: cleanString(settings.announcementLabel),
    announcementTitle: cleanString(settings.announcementTitle),
    announcementDescription: cleanString(settings.announcementDescription),
    announcementCtaLabel: cleanString(settings.announcementCtaLabel),
    announcementCtaHref: cleanString(settings.announcementCtaHref),
    updatedById,
    homepageFieldStyles: serializeHomepageInlineDesignSettings(safeFieldStyles, safeLayoutSettings, safeCustomBlocks)
  };

  return prisma.homepageSetting.upsert({
    where: { id: HOMEPAGE_SETTINGS_ID },
    create: { id: HOMEPAGE_SETTINGS_ID, ...data },
    update: data
  });
}
