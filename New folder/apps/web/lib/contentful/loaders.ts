import { getSortedNavigationLinks } from "@/lib/site";
import {
  fetchContentfulEntries,
  toAssetMap
} from "@/lib/contentful/client";
import {
  mapContentfulCategoryContent,
  mapContentfulHomepageSettings,
  mapContentfulNavigationItem,
  mapContentfulNews,
  mapContentfulProduct,
  mapContentfulSiteSettings
} from "@/lib/contentful/mappers";
import type {
  ContentfulCategoryContentFields,
  ContentfulHomepageSettingsFields,
  ContentfulNavigationItemFields,
  ContentfulNewsFields,
  ContentfulProductFields,
  ContentfulSiteSettingsFields
} from "@/lib/contentful/types";
import type { Product } from "@/lib/mock-data";
import type { NewsArticle } from "@/lib/mock-news";
import type { NavigationLink, StorefrontSettings } from "@/lib/site";
import type { HomePageContent } from "@/lib/mock-homepage";
import type { CmsCategoryContent } from "@/lib/contentful/types";

export async function loadContentfulProducts(): Promise<Product[]> {
  const response = await fetchContentfulEntries<ContentfulProductFields>("product", {
    order: "-fields.priority,-sys.createdAt"
  });
  const assets = toAssetMap(response.includes);

  return (
    response.items
      ?.map((item, index) => mapContentfulProduct(item, assets, index))
      .filter((item): item is Product => Boolean(item)) || []
  );
}

export async function loadContentfulNews(): Promise<NewsArticle[]> {
  const response = await fetchContentfulEntries<ContentfulNewsFields>("newsArticle", {
    order: "-fields.priority,-fields.publishedAt,-sys.createdAt"
  });
  const assets = toAssetMap(response.includes);

  return (
    response.items
      ?.map((item, index) => mapContentfulNews(item, assets, index))
      .filter((item): item is NewsArticle => Boolean(item)) || []
  );
}

export async function loadContentfulSiteSettings(): Promise<StorefrontSettings> {
  const response = await fetchContentfulEntries<ContentfulSiteSettingsFields>("siteSettings", {
    limit: 1
  });
  const assets = toAssetMap(response.includes);

  return mapContentfulSiteSettings(response.items?.[0], assets);
}

export async function loadContentfulHomepageSettings(): Promise<HomePageContent> {
  const response = await fetchContentfulEntries<ContentfulHomepageSettingsFields>(
    "homepageSettings",
    {
      limit: 1
    }
  );

  return mapContentfulHomepageSettings(response.items?.[0]);
}

export async function loadContentfulNavigationItems(): Promise<NavigationLink[]> {
  const response = await fetchContentfulEntries<ContentfulNavigationItemFields>("navigationItem", {
    order: "-fields.priority,-sys.createdAt"
  });

  return getSortedNavigationLinks(
    response.items
      ?.map((item, index) => mapContentfulNavigationItem(item, index))
      .filter((item): item is NavigationLink => Boolean(item)) || []
  );
}

export async function loadContentfulCategoryContent(): Promise<CmsCategoryContent[]> {
  const response = await fetchContentfulEntries<ContentfulCategoryContentFields>("categoryContent", {
    order: "-fields.priority,-sys.createdAt"
  });

  return (
    response.items
      ?.map((item) => mapContentfulCategoryContent(item))
      .filter((item): item is CmsCategoryContent => Boolean(item)) || []
  );
}
