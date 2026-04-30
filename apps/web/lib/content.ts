import { cache } from "react";
import {
  categories,
  getDiscountPercent,
  products as fallbackProducts,
  type Product,
  type ProductCategory
} from "@/lib/mock-data";
import { homePageContent as fallbackHomePageContent } from "@/lib/mock-homepage";
import { newsArticles as fallbackNews, type NewsArticle } from "@/lib/mock-news";
import {
  getContentSourceInfo,
  isContentfulConfigured
} from "@/lib/contentful/client";
import {
  loadContentfulCategoryContent,
  loadContentfulHomepageSettings,
  loadContentfulNavigationItems,
  loadContentfulNews,
  loadContentfulProducts,
  loadContentfulSiteSettings
} from "@/lib/contentful/loaders";
import {
  getContentModelDefinitionById,
  storefrontContentModelDefinitions
} from "@/lib/contentful/model-definitions";
import {
  fallbackStorefrontSettings,
  type StorefrontSettings
} from "@/lib/site";
import {
  getStoredHomepageSettings,
  getStoredSiteSettings,
  mergeHomepageContent,
  mergeStorefrontSettings
} from "@/lib/settings/admin-settings";
import { listInternalProducts } from "@/lib/db";
import {
  isInternalProductsEnabled,
  mapInternalStoreProductToStorefrontProduct
} from "@/lib/store-products";

export {
  getContentModelDefinitionById,
  getContentSourceInfo,
  isContentfulConfigured,
  storefrontContentModelDefinitions
};

type CategoryMeta = (typeof categories)[number];

function isPublicProduct(product: Product) {
  return !product.status || product.status === "active";
}

function isPublicNews(article: NewsArticle) {
  return !article.status || article.status === "active";
}

function sortProducts(items: Product[]) {
  return [...items].sort(
    (left, right) =>
      (right.priority || 0) - (left.priority || 0) ||
      Number(Boolean(right.isFeatured)) - Number(Boolean(left.isFeatured))
  );
}

function sortNews(items: NewsArticle[]) {
  return [...items]
    .filter(isPublicNews)
    .sort(
      (left, right) =>
        Number(Boolean(right.isFeatured)) - Number(Boolean(left.isFeatured)) ||
        (right.priority || 0) - (left.priority || 0) ||
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
    );
}

function warnCmsFallback(scope: string, error: unknown) {
  console.warn(`Falling back to local ${scope} because Contentful failed:`, error);
}

function warnInternalProductFallback(error: unknown) {
  console.warn("Falling back to Contentful/local products because internal products failed:", error);
}

function mergeInternalProducts(baseProducts: Product[], internalProducts: Awaited<ReturnType<typeof listInternalProducts>>) {
  const bySlug = new Map(baseProducts.map((product) => [product.slug, product]));

  for (const internalProduct of internalProducts) {
    const fallbackProduct = bySlug.get(internalProduct.slug);

    if (!internalProduct.isActive) {
      bySlug.delete(internalProduct.slug);
      continue;
    }

    bySlug.set(
      internalProduct.slug,
      mapInternalStoreProductToStorefrontProduct(internalProduct, fallbackProduct)
    );
  }

  return [...bySlug.values()];
}

function mergeCategoryOverrides(categoryItems: CategoryMeta[], overrides: Awaited<ReturnType<typeof loadContentfulCategoryContent>>) {
  const overrideMap = new Map(overrides.map((item) => [item.key, item]));

  return categoryItems.map((item) => {
    if (item.key === "all") {
      return item;
    }

    const override = overrideMap.get(item.key);

    return {
      ...item,
      label: override?.label || item.label,
      description: override?.description || item.description
    };
  });
}

export const getStorefrontSettings = cache(async () => {
  let baseSettings: StorefrontSettings = fallbackStorefrontSettings;
  let navigation = fallbackStorefrontSettings.navigation;

  if (isContentfulConfigured()) {
    const [siteSettingsResult, navigationResult] = await Promise.allSettled([
      loadContentfulSiteSettings(),
      loadContentfulNavigationItems()
    ]);

    if (siteSettingsResult.status === "rejected") {
      warnCmsFallback("site settings", siteSettingsResult.reason);
    }

    if (navigationResult.status === "rejected") {
      warnCmsFallback("navigation", navigationResult.reason);
    }

    baseSettings =
      siteSettingsResult.status === "fulfilled"
        ? siteSettingsResult.value
        : fallbackStorefrontSettings;
    navigation =
      navigationResult.status === "fulfilled" && navigationResult.value.length > 0
        ? navigationResult.value
        : baseSettings.navigation;
  }

  const adminSettings = await getStoredSiteSettings();

  return {
    ...mergeStorefrontSettings(baseSettings, adminSettings),
    navigation
  } satisfies StorefrontSettings;
});

export const getStoreProducts = cache(async () => {
  const sourceProducts = await (async () => {
    if (!isContentfulConfigured()) {
      return sortProducts(fallbackProducts.filter(isPublicProduct));
    }

    try {
      return sortProducts((await loadContentfulProducts()).filter(isPublicProduct));
    } catch (error) {
      warnCmsFallback("products", error);
      return sortProducts(fallbackProducts.filter(isPublicProduct));
    }
  })();

  if (!isInternalProductsEnabled()) {
    return sourceProducts;
  }

  try {
    const internalProducts = await listInternalProducts({
      includeInactive: true
    });
    return sortProducts(mergeInternalProducts(sourceProducts, internalProducts));
  } catch (error) {
    warnInternalProductFallback(error);
    return sourceProducts;
  }
});

export const getStoreNews = cache(async () => {
  if (!isContentfulConfigured()) {
    return sortNews(fallbackNews);
  }

  try {
    return sortNews(await loadContentfulNews());
  } catch (error) {
    warnCmsFallback("news", error);
    return sortNews(fallbackNews);
  }
});

export const getHomePageContent = cache(async () => {
  let baseContent = fallbackHomePageContent;

  if (isContentfulConfigured()) {
    try {
      baseContent = await loadContentfulHomepageSettings();
    } catch (error) {
      warnCmsFallback("homepage settings", error);
      baseContent = fallbackHomePageContent;
    }
  }

  const adminSettings = await getStoredHomepageSettings();
  return mergeHomepageContent(baseContent, adminSettings);
});

export const getStoreCategories = cache(async () => {
  if (!isContentfulConfigured()) {
    return categories;
  }

  try {
    const overrides = await loadContentfulCategoryContent();
    return mergeCategoryOverrides(categories, overrides);
  } catch (error) {
    warnCmsFallback("category content", error);
    return categories;
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
  const [products, categoryItems] = await Promise.all([getStoreProducts(), getStoreCategories()]);

  return categoryItems
    .filter(
      (
        item
      ): item is {
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

export async function getStoreCategoryMeta(key: string) {
  const categoryItems = await getStoreCategories();
  return categoryItems.find((item) => item.key === key);
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
