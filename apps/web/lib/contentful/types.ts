import type { Product, ProductCategory, ProductStatus } from "@/lib/mock-data";
import type { NavigationLocation } from "@/lib/site";

export type ContentfulLink = {
  sys?: {
    id?: string;
    linkType?: string;
    type?: string;
  };
};

export type ContentfulAsset = {
  sys?: {
    id?: string;
  };
  fields?: {
    title?: string;
    file?: {
      url?: string;
      contentType?: string;
    };
  };
};

export type ContentfulItem<TFields> = {
  sys?: {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  fields?: TFields;
};

export type ContentfulResponse<TFields> = {
  items?: Array<ContentfulItem<TFields>>;
  includes?: {
    Asset?: ContentfulAsset[];
  };
};

type Accent = Product["accent"];

export type ContentfulProductFields = {
  slug?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  category?: ProductCategory;
  brand?: string;
  price?: number;
  comparePrice?: number;
  currency?: Product["currency"];
  delivery?: string;
  deliveryNote?: string;
  features?: string[];
  notes?: string[];
  badge?: string;
  coverLabel?: string;
  accent?: Accent;
  isFeatured?: boolean;
  status?: ProductStatus;
  image?: ContentfulLink;
  galleryImages?: ContentfulLink[];
  videoFile?: ContentfulLink;
  videoUrl?: string;
  supportNote?: string;
  trustNote?: string;
  priority?: number;
};

export type ContentfulNewsFields = {
  slug?: string;
  title?: string;
  summary?: string;
  excerpt?: string;
  body?: string;
  image?: ContentfulLink;
  videoFile?: ContentfulLink;
  videoUrl?: string;
  publishedAt?: string;
  status?: "active" | "draft";
  isFeatured?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  priority?: number;
};

export type ContentfulSiteSettingsFields = {
  brandName?: string;
  siteTitle?: string;
  siteDescription?: string;
  brandTagline?: string;
  logo?: ContentfulLink;
  topBarText?: string;
  topBarHighlights?: string[];
  supportPhone?: string;
  supportEmail?: string;
  supportAddress?: string;
  supportCtaLabel?: string;
  supportCtaHref?: string;
  telegramUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  footerText?: string;
  copyrightText?: string;
  trustBadges?: string[];
};

export type ContentfulHomepageSettingsFields = {
  heroEyebrow?: string;
  heroStatusLabel?: string;
  heroTitleLead?: string;
  heroTitleHighlight?: string;
  heroTitleTail?: string;
  heroDescription?: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  heroProofTitle?: string;
  heroProofText?: string;
  heroQuickStartTitle?: string;
  heroQuickStartText?: string;
  heroMarketLabel?: string;
  heroMarketTitle?: string;
  heroMarketDescription?: string;
  heroMarketBadge?: string;
  showCategorySection?: boolean;
  categoriesEyebrow?: string;
  categoriesTitle?: string;
  categoriesDescription?: string;
  categoriesCtaLabel?: string;
  categoriesCtaHref?: string;
  showFeaturedSection?: boolean;
  featuredEyebrow?: string;
  featuredTitle?: string;
  featuredDescription?: string;
  featuredCtaLabel?: string;
  featuredCtaHref?: string;
  showNewsSection?: boolean;
  newsEyebrow?: string;
  newsTitle?: string;
  newsDescription?: string;
  newsCtaLabel?: string;
  newsCtaHref?: string;
  newsAdminCalloutLabel?: string;
  newsAdminCalloutTitle?: string;
  newsAdminCalloutDescription?: string;
  showSupportBanner?: boolean;
  announcementLabel?: string;
  announcementTitle?: string;
  announcementDescription?: string;
  announcementCtaLabel?: string;
  announcementCtaHref?: string;
};

export type ContentfulNavigationItemFields = {
  label?: string;
  href?: string;
  location?: NavigationLocation;
  openInNewTab?: boolean;
  priority?: number;
  status?: "active" | "draft";
};

export type ContentfulCategoryContentFields = {
  key?: ProductCategory;
  label?: string;
  description?: string;
  status?: "active" | "draft";
  priority?: number;
};

export type CmsCategoryContent = {
  key: ProductCategory;
  label?: string;
  description?: string;
  priority?: number;
};
