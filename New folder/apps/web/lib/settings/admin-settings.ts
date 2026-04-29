import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { homePageContent as fallbackHomePageContent, type HomePageContent } from "@/lib/mock-homepage";
import { fallbackStorefrontSettings, type StorefrontSettings } from "@/lib/site";

export const SITE_SETTINGS_ID = "main";
export const HOMEPAGE_SETTINGS_ID = "main";

function cleanString(value: FormDataEntryValue | string | null | undefined) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
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

function isHexColor(value: string | null | undefined) {
  return Boolean(value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value));
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
    appearance: {
      primaryColor: isHexColor(settings.primaryColor) ? settings.primaryColor : base.appearance.primaryColor,
      secondaryColor: isHexColor(settings.secondaryColor) ? settings.secondaryColor : base.appearance.secondaryColor,
      fontFamily: pickText(settings, "fontFamily", base.appearance.fontFamily)
    }
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
      marketBadge: pickText(settings, "heroMarketBadge", base.hero.marketBadge)
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

  return {
    siteTitle: settings?.siteTitle || merged.brandName,
    tagline: settings?.tagline || merged.brandTagline,
    metaDescription: settings?.metaDescription || merged.siteDescription,
    logoUrl: settings?.logoUrl || merged.logoUrl || "",
    faviconUrl: settings?.faviconUrl || "",
    primaryColor: settings?.primaryColor || merged.appearance.primaryColor,
    secondaryColor: settings?.secondaryColor || merged.appearance.secondaryColor,
    fontFamily: settings?.fontFamily || merged.appearance.fontFamily,
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
    defaultSeoDescription: settings?.defaultSeoDescription || merged.siteDescription
  };
}

export function getEditableHomepageSettingsDefaults(settings: Awaited<ReturnType<typeof getStoredHomepageSettings>>) {
  return mergeHomepageContent(fallbackHomePageContent, settings);
}

export async function saveSiteSettingsFromForm(formData: FormData, updatedById: string) {
  const data = {
    siteTitle: cleanString(formData.get("siteTitle")),
    tagline: cleanString(formData.get("tagline")),
    metaDescription: cleanString(formData.get("metaDescription")),
    logoUrl: cleanString(formData.get("logoUrl")),
    faviconUrl: cleanString(formData.get("faviconUrl")),
    primaryColor: cleanString(formData.get("primaryColor")),
    secondaryColor: cleanString(formData.get("secondaryColor")),
    fontFamily: cleanString(formData.get("fontFamily")),
    footerText: cleanString(formData.get("footerText")),
    contactPhone: cleanString(formData.get("contactPhone")),
    contactEmail: cleanString(formData.get("contactEmail")),
    contactAddress: cleanString(formData.get("contactAddress")),
    supportCtaLabel: cleanString(formData.get("supportCtaLabel")),
    supportCtaHref: cleanString(formData.get("supportCtaHref")),
    telegramUrl: cleanString(formData.get("telegramUrl")),
    instagramUrl: cleanString(formData.get("instagramUrl")),
    whatsappUrl: cleanString(formData.get("whatsappUrl")),
    defaultSeoTitle: cleanString(formData.get("defaultSeoTitle")),
    defaultSeoDescription: cleanString(formData.get("defaultSeoDescription")),
    updatedById
  };

  return prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { id: SITE_SETTINGS_ID, ...data },
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
    heroPrimaryCtaHref: cleanString(formData.get("heroPrimaryCtaHref")),
    heroSecondaryCtaLabel: cleanString(formData.get("heroSecondaryCtaLabel")),
    heroSecondaryCtaHref: cleanString(formData.get("heroSecondaryCtaHref")),
    heroProofTitle: cleanString(formData.get("heroProofTitle")),
    heroProofText: cleanString(formData.get("heroProofText")),
    heroQuickStartTitle: cleanString(formData.get("heroQuickStartTitle")),
    heroQuickStartText: cleanString(formData.get("heroQuickStartText")),
    heroMarketLabel: cleanString(formData.get("heroMarketLabel")),
    heroMarketTitle: cleanString(formData.get("heroMarketTitle")),
    heroMarketDescription: cleanString(formData.get("heroMarketDescription")),
    heroMarketBadge: cleanString(formData.get("heroMarketBadge")),
    showCategorySection: formData.get("showCategorySection") === "on",
    categoriesEyebrow: cleanString(formData.get("categoriesEyebrow")),
    categoriesTitle: cleanString(formData.get("categoriesTitle")),
    categoriesDescription: cleanString(formData.get("categoriesDescription")),
    categoriesCtaLabel: cleanString(formData.get("categoriesCtaLabel")),
    categoriesCtaHref: cleanString(formData.get("categoriesCtaHref")),
    showFeaturedSection: formData.get("showFeaturedSection") === "on",
    featuredEyebrow: cleanString(formData.get("featuredEyebrow")),
    featuredTitle: cleanString(formData.get("featuredTitle")),
    featuredDescription: cleanString(formData.get("featuredDescription")),
    featuredCtaLabel: cleanString(formData.get("featuredCtaLabel")),
    featuredCtaHref: cleanString(formData.get("featuredCtaHref")),
    showNewsSection: formData.get("showNewsSection") === "on",
    newsEyebrow: cleanString(formData.get("newsEyebrow")),
    newsTitle: cleanString(formData.get("newsTitle")),
    newsDescription: cleanString(formData.get("newsDescription")),
    newsCtaLabel: cleanString(formData.get("newsCtaLabel")),
    newsCtaHref: cleanString(formData.get("newsCtaHref")),
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
    announcementCtaHref: cleanString(formData.get("announcementCtaHref")),
    updatedById
  };

  return prisma.homepageSetting.upsert({
    where: { id: HOMEPAGE_SETTINGS_ID },
    create: { id: HOMEPAGE_SETTINGS_ID, ...data },
    update: data
  });
}
