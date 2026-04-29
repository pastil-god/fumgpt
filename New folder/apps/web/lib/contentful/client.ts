import type { ContentfulAsset, ContentfulLink, ContentfulResponse } from "@/lib/contentful/types";

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const CONTENTFUL_ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;
const CONTENTFUL_REVALIDATE_SECONDS = 60;

export function isContentfulConfigured() {
  return Boolean(CONTENTFUL_SPACE_ID && CONTENTFUL_DELIVERY_TOKEN);
}

export function getContentSourceInfo() {
  return {
    cmsConfigured: isContentfulConfigured(),
    cmsMode: isContentfulConfigured() ? "contentful" : "fallback"
  } as const;
}

export async function fetchContentfulEntries<TFields>(
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
      revalidate: CONTENTFUL_REVALIDATE_SECONDS
    }
  });

  if (!response.ok) {
    throw new Error(`Contentful request failed with status ${response.status}`);
  }

  return (await response.json()) as ContentfulResponse<TFields>;
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

export function toAssetMap(includes?: ContentfulResponse<unknown>["includes"]) {
  const map = new Map<string, ContentfulAsset>();

  for (const asset of includes?.Asset || []) {
    if (asset.sys?.id) {
      map.set(asset.sys.id, asset);
    }
  }

  return map;
}

export function resolveLinkedAssetUrl(
  link: ContentfulLink | undefined,
  assets: Map<string, ContentfulAsset>
) {
  const assetId = link?.sys?.id;

  if (!assetId) {
    return undefined;
  }

  return normalizeAssetUrl(assets.get(assetId)?.fields?.file?.url);
}

export function resolveLinkedAssetUrls(
  links: ContentfulLink[] | undefined,
  assets: Map<string, ContentfulAsset>
) {
  const urls = (links || [])
    .map((link) => resolveLinkedAssetUrl(link, assets))
    .filter((url): url is string => Boolean(url));

  return [...new Set(urls)];
}

export function pickStringList(list: string[] | undefined, fallback: string[]) {
  const normalized = (list || []).map((item) => item.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}
