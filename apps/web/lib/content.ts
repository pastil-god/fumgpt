import { cache } from "react";
import {
  categories,
  getDiscountPercent,
  products as fallbackProducts,
  type Product,
  type ProductCategory,
  type ProductStatus
} from "@/lib/mock-data";
import { homePageContent as fallbackHomePageContent, type HomePageContent } from "@/lib/mock-homepage";
import { newsArticles as fallbackNews, type NewsArticle } from "@/lib/mock-news";

type Accent = Product["accent"];

type ContentfulLink = {
  sys?: {
    id?: string;
    linkType?: string;
    type?: string;
  };
};

type ContentfulAsset = {
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

type ContentfulItem<TFields> = {
  sys?: {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  fields?: TFields;
};

type ContentfulResponse<TFields> = {
  items?: Array<ContentfulItem<TFields>>;
  includes?: {
    Asset?: ContentfulAsset[];
  };
};

type ContentfulProductFields = {
  slug?: string;
  title?: string;
  category?: ProductCategory;
  brand?: string;
  price?: number;
  comparePrice?: number;
  currency?: Product["currency"];
  delivery?: string;
  shortDescription?: string;
  description?: string;
  features?: string[];
  notes?: string[];
  badge?: string;
  coverLabel?: string;
  accent?: Accent;
  isFeatured?: boolean;
  status?: ProductStatus;
  image?: ContentfulLink;
  videoFile?: ContentfulLink;
  videoUrl?: string;
};

type ContentfulNewsFields = {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  image?: ContentfulLink;
  videoFile?: ContentfulLink;
  videoUrl?: string;
  publishedAt?: string;
  isFeatured?: boolean;
};

type ContentfulSiteSettingsFields = {
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
  newsEyebrow?: string;
  newsTitle?: string;
  newsDescription?: string;
  newsCtaLabel?: string;
  announcementLabel?: string;
  announcementTitle?: string;
  announcementDescription?: string;
  announcementCtaLabel?: string;
  announcementCtaHref?: string;
};

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;

const accentFallbacks: Accent[] = ["emerald", "cyan", "violet", "amber"];

export function isContentfulConfigured() {
  return Boolean(CONTENTFUL_SPACE_ID && CONTENTFUL_DELIVERY_TOKEN);
}

export function getContentSourceInfo() {
  return {
    cmsConfigured: isContentfulConfigured(),
    cmsMode: isContentfulConfigured() ? "contentful" : "fallback"
  } as const;
}

function normalizeAssetUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url;
}

function toAssetMap(includes?: ContentfulResponse<unknown>["includes"]) {
  const map = new Map<string, ContentfulAsset>();

  for (const asset of includes?.Asset || []) {
    if (asset.sys?.id) {
      map.set(asset.sys.id, asset);
    }
  }

  return map;
}

function resolveLinkedAssetUrl(link: ContentfulLink | undefined, assets: Map<string, ContentfulAsset>) {
  const assetId = link?.sys?.id;

  if (!assetId) {
    return undefined;
  }

  return normalizeAssetUrl(assets.get(assetId)?.fields?.file?.url);
}

function buildProductBadge(comparePrice: number, price: number) {
  return `${getDiscountPercent(comparePrice, price)}٪ تخفیف`;
}

function isPublicProduct(product: Product) {
  return !product.status || product.status === "active";
}

function sortNewsByDate(items: NewsArticle[]) {
  return [...items].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}

async function fetchContentfulEntries<TFields>(
  contentType: string,
  searchParams?: Record<string, string | number | boolean | undefined>
) {
  const params = new URLSearchParams({
    content_type: contentType,
    include: "2"
  });

  for (const [key, value] of Object.entries(searchParams || {})) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const response = await fetch(`${CONTENTFUL_BASE_URL}/entries?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${CONTENTFUL_DELIVERY_TOKEN}`
    },
    next: {
      revalidate: 60
    }
  });

  if (!response.ok) {
    throw new Error(`Contentful request failed with status ${response.status}`);
  }

  return (await response.json()) as ContentfulResponse<TFields>;
}

function mapContentfulProduct(
  item: ContentfulItem<ContentfulProductFields>,
  assets: Map<string, ContentfulAsset>,
  index: number
): Product | null {
  const fields = item.fields;

  if (
    !fields?.slug ||
    !fields.title ||
    !fields.category ||
    typeof fields.price !== "number" ||
    typeof fields.comparePrice !== "number"
  ) {
    return null;
  }

  return {
    id: item.sys?.id || `cms-product-${index}`,
    slug: fields.slug,
    title: fields.title,
    category: fields.category,
    brand: fields.brand || "FumGPT",
    price: fields.price,
    comparePrice: fields.comparePrice,
    currency: fields.currency || "IRR",
    delivery: fields.delivery || "تحویل دیجیتال",
    shortDescription: fields.shortDescription || "",
    description: fields.description || fields.shortDescription || "",
    features: fields.features || [],
    notes: fields.notes || [],
    badge: fields.badge || buildProductBadge(fields.comparePrice, fields.price),
    coverLabel: fields.coverLabel || fields.brand || fields.title,
    accent: fields.accent || accentFallbacks[index % accentFallbacks.length],
    isFeatured: Boolean(fields.isFeatured),
    status: fields.status || "active",
    imageUrl: resolveLinkedAssetUrl(fields.image, assets),
    videoUrl: resolveLinkedAssetUrl(fields.videoFile, assets) || fields.videoUrl
  };
}

function mapContentfulNews(
  item: ContentfulItem<ContentfulNewsFields>,
  assets: Map<string, ContentfulAsset>,
  index: number
): NewsArticle | null {
  const fields = item.fields;

  if (!fields?.slug || !fields.title || !fields.excerpt) {
    return null;
  }

  return {
    id: item.sys?.id || `cms-news-${index}`,
    slug: fields.slug,
    title: fields.title,
    excerpt: fields.excerpt,
    body: fields.body || fields.excerpt,
    imageUrl: resolveLinkedAssetUrl(fields.image, assets),
    videoUrl: resolveLinkedAssetUrl(fields.videoFile, assets) || fields.videoUrl,
    publishedAt: fields.publishedAt || item.sys?.createdAt || new Date().toISOString(),
    isFeatured: Boolean(fields.isFeatured)
  };
}

function mapContentfulSiteSettings(item?: ContentfulItem<ContentfulSiteSettingsFields>): HomePageContent {
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
      proofText: fields?.heroProofText || fallbackHomePageContent.hero.proofText
    },
    newsSection: {
      eyebrow: fields?.newsEyebrow || fallbackHomePageContent.newsSection.eyebrow,
      title: fields?.newsTitle || fallbackHomePageContent.newsSection.title,
      description: fields?.newsDescription || fallbackHomePageContent.newsSection.description,
      ctaLabel: fields?.newsCtaLabel || fallbackHomePageContent.newsSection.ctaLabel
    },
    announcement: {
      label: fields?.announcementLabel || fallbackHomePageContent.announcement.label,
      title: fields?.announcementTitle || fallbackHomePageContent.announcement.title,
      description:
        fields?.announcementDescription || fallbackHomePageContent.announcement.description,
      ctaLabel: fields?.announcementCtaLabel || fallbackHomePageContent.announcement.ctaLabel,
      ctaHref: fields?.announcementCtaHref || fallbackHomePageContent.announcement.ctaHref
    }
  };
}

async function loadContentfulProducts() {
  const response = await fetchContentfulEntries<ContentfulProductFields>("product", {
    order: "-sys.createdAt"
  });
  const assets = toAssetMap(response.includes);

  return (
    response.items
      ?.map((item, index) => mapContentfulProduct(item, assets, index))
      .filter((item): item is Product => Boolean(item))
      .filter(isPublicProduct) || []
  );
}

async function loadContentfulNews() {
  const response = await fetchContentfulEntries<ContentfulNewsFields>("newsArticle", {
    order: "-fields.publishedAt"
  });
  const assets = toAssetMap(response.includes);

  return (
    response.items
      ?.map((item, index) => mapContentfulNews(item, assets, index))
      .filter((item): item is NewsArticle => Boolean(item)) || []
  );
}

async function loadContentfulSiteSettings() {
  const response = await fetchContentfulEntries<ContentfulSiteSettingsFields>("siteSettings", {
    limit: 1
  });

  return mapContentfulSiteSettings(response.items?.[0]);
}

export const getStoreProducts = cache(async () => {
  if (!isContentfulConfigured()) {
    return fallbackProducts.filter(isPublicProduct);
  }

  try {
    const contentfulProducts = await loadContentfulProducts();
    return contentfulProducts;
  } catch (error) {
    console.warn("Falling back to local products because Contentful failed:", error);
    return fallbackProducts.filter(isPublicProduct);
  }
});

export const getStoreNews = cache(async () => {
  if (!isContentfulConfigured()) {
    return sortNewsByDate(fallbackNews);
  }

  try {
    const contentfulNews = await loadContentfulNews();
    return sortNewsByDate(contentfulNews);
  } catch (error) {
    console.warn("Falling back to local news because Contentful failed:", error);
    return sortNewsByDate(fallbackNews);
  }
});

export const getHomePageContent = cache(async () => {
  if (!isContentfulConfigured()) {
    return fallbackHomePageContent;
  }

  try {
    return await loadContentfulSiteSettings();
  } catch (error) {
    console.warn("Falling back to local homepage settings because Contentful failed:", error);
    return fallbackHomePageContent;
  }
});

export async function getFeaturedStoreProducts(limit?: number) {
  const products = await getStoreProducts();
  const featured = products.filter((item) => item.isFeatured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export async function filterStoreProducts(category?: string) {
  const products = await getStoreProducts();

  if (!category || category === "all") {
    return products;
  }

  return products.filter((item) => item.category === category);
}

export async function getStoreProductBySlug(slug: string) {
  const products = await getStoreProducts();
  return products.find((item) => item.slug === slug);
}

export async function getStoreRelatedProducts(category: ProductCategory, currentId: string) {
  const products = await getStoreProducts();
  return products.filter((item) => item.category === category && item.id !== currentId).slice(0, 3);
}

export async function getStoreCategoryCounts() {
  const products = await getStoreProducts();

  return categories
    .filter(
      (item): item is {
        key: ProductCategory;
        label: string;
        description: string;
      } => item.key !== "all"
    )
    .map((item) => ({
      ...item,
      count: products.filter((product) => product.category === item.key).length
    }));
}

export async function getHeroStats() {
  const products = await getStoreProducts();
  const activeCategories = categories.filter((item) => item.key !== "all");
  const brandCount = new Set(products.map((item) => item.brand)).size;
  const maxDiscount = products.length
    ? Math.max(...products.map((item) => getDiscountPercent(item.comparePrice, item.price)))
    : 0;

  return {
    productCount: products.length,
    activeCategoryCount: activeCategories.length,
    brandCount,
    maxDiscount
  };
}

export async function getStoreNewsBySlug(slug: string) {
  const news = await getStoreNews();
  return news.find((item) => item.slug === slug);
}

export async function getRelatedNewsArticles(currentId: string, limit = 3) {
  const news = await getStoreNews();
  return news.filter((item) => item.id !== currentId).slice(0, limit);
}

export function getCategoryMeta(key: string) {
  return categories.find((item) => item.key === key);
}

export function formatPersianDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "long"
  }).format(new Date(date));
}

export function isDirectVideoFile(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}
