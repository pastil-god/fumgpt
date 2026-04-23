import type {
  CmsCategoryContent,
  ContentfulAsset,
  ContentfulCategoryContentFields,
  ContentfulHomepageSettingsFields,
  ContentfulItem,
  ContentfulNavigationItemFields,
  ContentfulNewsFields,
  ContentfulProductFields,
  ContentfulSiteSettingsFields
} from "@/lib/contentful/types";
import { pickStringList, resolveLinkedAssetUrl, resolveLinkedAssetUrls } from "@/lib/contentful/client";
import {
  categories,
  getDiscountPercent,
  type Product,
  type ProductCategory
} from "@/lib/mock-data";
import { homePageContent as fallbackHomePageContent, type HomePageContent } from "@/lib/mock-homepage";
import { type NewsArticle } from "@/lib/mock-news";
import {
  fallbackStorefrontSettings,
  type NavigationLink,
  type NavigationLocation,
  type StorefrontSettings
} from "@/lib/site";

type Accent = Product["accent"];

const accentFallbacks: Accent[] = ["emerald", "cyan", "violet", "amber"];

function buildProductBadge(comparePrice: number, price: number) {
  return `${getDiscountPercent(comparePrice, price).toLocaleString("fa-IR")}٪ تخفیف`;
}

function normalizeNavigationLocation(value?: string): NavigationLocation {
  if (value === "primary" || value === "footer" || value === "both") {
    return value;
  }

  return "both";
}

function isKnownCategory(value?: ProductCategory) {
  return categories.some((item) => item.key === value);
}

export function mapContentfulProduct(
  item: ContentfulItem<ContentfulProductFields>,
  assets: Map<string, ContentfulAsset>,
  index: number
): Product | null {
  const fields = item.fields;

  if (!fields?.slug || !fields.title || !fields.category || typeof fields.price !== "number") {
    return null;
  }

  const comparePrice =
    typeof fields.comparePrice === "number" ? fields.comparePrice : fields.price;
  const galleryImageUrls = resolveLinkedAssetUrls(fields.galleryImages, assets);
  const imageUrl = resolveLinkedAssetUrl(fields.image, assets) || galleryImageUrls[0];

  return {
    id: item.sys?.id || `cms-product-${index}`,
    slug: fields.slug,
    title: fields.title,
    category: fields.category,
    brand: fields.brand || "FumGPT",
    price: fields.price,
    comparePrice,
    currency: fields.currency || "IRR",
    delivery: fields.delivery || "تحویل دیجیتال",
    deliveryNote: fields.deliveryNote,
    shortDescription: fields.shortDescription || "",
    description: fields.description || fields.shortDescription || "",
    features: fields.features || [],
    notes: fields.notes || [],
    badge: fields.badge || buildProductBadge(comparePrice, fields.price),
    coverLabel: fields.coverLabel || fields.brand || fields.title,
    accent: fields.accent || accentFallbacks[index % accentFallbacks.length],
    isFeatured: Boolean(fields.isFeatured),
    status: fields.status || "active",
    imageUrl,
    galleryImageUrls,
    videoUrl: resolveLinkedAssetUrl(fields.videoFile, assets) || fields.videoUrl,
    supportNote: fields.supportNote,
    trustNote: fields.trustNote,
    priority: typeof fields.priority === "number" ? fields.priority : undefined
  };
}

export function mapContentfulNews(
  item: ContentfulItem<ContentfulNewsFields>,
  assets: Map<string, ContentfulAsset>,
  index: number
): NewsArticle | null {
  const fields = item.fields;
  const excerpt = fields?.summary || fields?.excerpt;

  if (!fields?.slug || !fields.title || !excerpt) {
    return null;
  }

  return {
    id: item.sys?.id || `cms-news-${index}`,
    slug: fields.slug,
    title: fields.title,
    excerpt,
    body: fields.body || excerpt,
    imageUrl: resolveLinkedAssetUrl(fields.image, assets),
    videoUrl: resolveLinkedAssetUrl(fields.videoFile, assets) || fields.videoUrl,
    publishedAt: fields.publishedAt || item.sys?.createdAt || new Date().toISOString(),
    isFeatured: Boolean(fields.isFeatured),
    status: fields.status || "active",
    ctaLabel: fields.ctaLabel,
    ctaHref: fields.ctaHref,
    priority: typeof fields.priority === "number" ? fields.priority : undefined
  };
}

export function mapContentfulSiteSettings(
  item: ContentfulItem<ContentfulSiteSettingsFields> | undefined,
  assets: Map<string, ContentfulAsset>
): StorefrontSettings {
  const fields = item?.fields;
  const logoUrl = resolveLinkedAssetUrl(fields?.logo, assets);

  return {
    brandName: fields?.brandName || fallbackStorefrontSettings.brandName,
    siteTitle: fields?.siteTitle || fallbackStorefrontSettings.siteTitle,
    siteDescription: fields?.siteDescription || fallbackStorefrontSettings.siteDescription,
    brandTagline: fields?.brandTagline || fallbackStorefrontSettings.brandTagline,
    logoUrl: logoUrl || fallbackStorefrontSettings.logoUrl,
    topBarText: fields?.topBarText || fallbackStorefrontSettings.topBarText,
    topBarHighlights: pickStringList(
      fields?.topBarHighlights,
      fallbackStorefrontSettings.topBarHighlights
    ),
    support: {
      phone: fields?.supportPhone || fallbackStorefrontSettings.support.phone,
      email: fields?.supportEmail || fallbackStorefrontSettings.support.email,
      address: fields?.supportAddress || fallbackStorefrontSettings.support.address,
      helpCtaLabel: fields?.supportCtaLabel || fallbackStorefrontSettings.support.helpCtaLabel,
      helpCtaHref:
        fields?.supportCtaHref ||
        fields?.telegramUrl ||
        fields?.whatsappUrl ||
        fallbackStorefrontSettings.support.helpCtaHref
    },
    socials: {
      telegram: fields?.telegramUrl || fallbackStorefrontSettings.socials.telegram,
      instagram: fields?.instagramUrl || fallbackStorefrontSettings.socials.instagram,
      whatsapp:
        fields?.whatsappUrl ||
        fields?.telegramUrl ||
        fallbackStorefrontSettings.socials.whatsapp
    },
    footer: {
      description: fields?.footerText || fallbackStorefrontSettings.footer.description,
      copyright: fields?.copyrightText || fallbackStorefrontSettings.footer.copyright
    },
    trustBadges: pickStringList(fields?.trustBadges, fallbackStorefrontSettings.trustBadges),
    navigation: fallbackStorefrontSettings.navigation
  };
}

export function mapContentfulHomepageSettings(
  item?: ContentfulItem<ContentfulHomepageSettingsFields>
): HomePageContent {
  const fields = item?.fields;

  return {
    hero: {
      eyebrow: fields?.heroEyebrow || fallbackHomePageContent.hero.eyebrow,
      statusLabel: fields?.heroStatusLabel || fallbackHomePageContent.hero.statusLabel,
      titleLead: fields?.heroTitleLead || fallbackHomePageContent.hero.titleLead,
      titleHighlight: fields?.heroTitleHighlight || fallbackHomePageContent.hero.titleHighlight,
      titleTail: fields?.heroTitleTail || fallbackHomePageContent.hero.titleTail,
      description: fields?.heroDescription || fallbackHomePageContent.hero.description,
      primaryCtaLabel:
        fields?.heroPrimaryCtaLabel || fallbackHomePageContent.hero.primaryCtaLabel,
      primaryCtaHref: fields?.heroPrimaryCtaHref || fallbackHomePageContent.hero.primaryCtaHref,
      secondaryCtaLabel:
        fields?.heroSecondaryCtaLabel || fallbackHomePageContent.hero.secondaryCtaLabel,
      secondaryCtaHref:
        fields?.heroSecondaryCtaHref || fallbackHomePageContent.hero.secondaryCtaHref,
      proofTitle: fields?.heroProofTitle || fallbackHomePageContent.hero.proofTitle,
      proofText: fields?.heroProofText || fallbackHomePageContent.hero.proofText,
      quickStartTitle:
        fields?.heroQuickStartTitle || fallbackHomePageContent.hero.quickStartTitle,
      quickStartText: fields?.heroQuickStartText || fallbackHomePageContent.hero.quickStartText,
      marketLabel: fields?.heroMarketLabel || fallbackHomePageContent.hero.marketLabel,
      marketTitle: fields?.heroMarketTitle || fallbackHomePageContent.hero.marketTitle,
      marketDescription:
        fields?.heroMarketDescription || fallbackHomePageContent.hero.marketDescription,
      marketBadge: fields?.heroMarketBadge || fallbackHomePageContent.hero.marketBadge
    },
    categorySection: {
      isVisible:
        fields?.showCategorySection ?? fallbackHomePageContent.categorySection.isVisible,
      eyebrow: fields?.categoriesEyebrow || fallbackHomePageContent.categorySection.eyebrow,
      title: fields?.categoriesTitle || fallbackHomePageContent.categorySection.title,
      description:
        fields?.categoriesDescription || fallbackHomePageContent.categorySection.description,
      ctaLabel: fields?.categoriesCtaLabel || fallbackHomePageContent.categorySection.ctaLabel,
      ctaHref: fields?.categoriesCtaHref || fallbackHomePageContent.categorySection.ctaHref
    },
    featuredSection: {
      isVisible:
        fields?.showFeaturedSection ?? fallbackHomePageContent.featuredSection.isVisible,
      eyebrow: fields?.featuredEyebrow || fallbackHomePageContent.featuredSection.eyebrow,
      title: fields?.featuredTitle || fallbackHomePageContent.featuredSection.title,
      description:
        fields?.featuredDescription || fallbackHomePageContent.featuredSection.description,
      ctaLabel: fields?.featuredCtaLabel || fallbackHomePageContent.featuredSection.ctaLabel,
      ctaHref: fields?.featuredCtaHref || fallbackHomePageContent.featuredSection.ctaHref
    },
    newsSection: {
      isVisible: fields?.showNewsSection ?? fallbackHomePageContent.newsSection.isVisible,
      eyebrow: fields?.newsEyebrow || fallbackHomePageContent.newsSection.eyebrow,
      title: fields?.newsTitle || fallbackHomePageContent.newsSection.title,
      description: fields?.newsDescription || fallbackHomePageContent.newsSection.description,
      ctaLabel: fields?.newsCtaLabel || fallbackHomePageContent.newsSection.ctaLabel,
      ctaHref: fields?.newsCtaHref || fallbackHomePageContent.newsSection.ctaHref,
      adminCalloutLabel:
        fields?.newsAdminCalloutLabel || fallbackHomePageContent.newsSection.adminCalloutLabel,
      adminCalloutTitle:
        fields?.newsAdminCalloutTitle || fallbackHomePageContent.newsSection.adminCalloutTitle,
      adminCalloutDescription:
        fields?.newsAdminCalloutDescription ||
        fallbackHomePageContent.newsSection.adminCalloutDescription
    },
    trustSection: {
      isVisible: fields?.showTrustSection ?? fallbackHomePageContent.trustSection.isVisible,
      eyebrow: fields?.trustEyebrow || fallbackHomePageContent.trustSection.eyebrow,
      title: fields?.trustTitle || fallbackHomePageContent.trustSection.title,
      points: pickStringList(fields?.trustPoints, fallbackHomePageContent.trustSection.points)
    },
    roadmapSection: {
      isVisible: fields?.showRoadmapSection ?? fallbackHomePageContent.roadmapSection.isVisible,
      eyebrow: fields?.roadmapEyebrow || fallbackHomePageContent.roadmapSection.eyebrow,
      title: fields?.roadmapTitle || fallbackHomePageContent.roadmapSection.title,
      phases: [
        {
          title:
            fields?.roadmapPhase1Title || fallbackHomePageContent.roadmapSection.phases[0].title,
          description:
            fields?.roadmapPhase1Description ||
            fallbackHomePageContent.roadmapSection.phases[0].description
        },
        {
          title:
            fields?.roadmapPhase2Title || fallbackHomePageContent.roadmapSection.phases[1].title,
          description:
            fields?.roadmapPhase2Description ||
            fallbackHomePageContent.roadmapSection.phases[1].description
        },
        {
          title:
            fields?.roadmapPhase3Title || fallbackHomePageContent.roadmapSection.phases[2].title,
          description:
            fields?.roadmapPhase3Description ||
            fallbackHomePageContent.roadmapSection.phases[2].description
        }
      ]
    },
    announcement: {
      isVisible: fields?.showSupportBanner ?? fallbackHomePageContent.announcement.isVisible,
      label: fields?.announcementLabel || fallbackHomePageContent.announcement.label,
      title: fields?.announcementTitle || fallbackHomePageContent.announcement.title,
      description:
        fields?.announcementDescription || fallbackHomePageContent.announcement.description,
      ctaLabel: fields?.announcementCtaLabel || fallbackHomePageContent.announcement.ctaLabel,
      ctaHref: fields?.announcementCtaHref || fallbackHomePageContent.announcement.ctaHref
    }
  };
}

export function mapContentfulNavigationItem(
  item: ContentfulItem<ContentfulNavigationItemFields>,
  index: number
): NavigationLink | null {
  const fields = item.fields;

  if (!fields?.label || !fields.href || fields.status === "draft") {
    return null;
  }

  return {
    label: fields.label,
    href: fields.href,
    location: normalizeNavigationLocation(fields.location),
    openInNewTab: Boolean(fields.openInNewTab),
    priority: typeof fields.priority === "number" ? fields.priority : 100 - index
  };
}

export function mapContentfulCategoryContent(
  item: ContentfulItem<ContentfulCategoryContentFields>
): CmsCategoryContent | null {
  const fields = item.fields;

  if (!fields?.key || fields.status === "draft" || !isKnownCategory(fields.key)) {
    return null;
  }

  return {
    key: fields.key,
    label: fields.label,
    description: fields.description,
    priority: typeof fields.priority === "number" ? fields.priority : undefined
  };
}
