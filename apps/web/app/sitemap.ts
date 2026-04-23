import type { MetadataRoute } from "next";
import { getStoreNews, getStoreProducts } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([getStoreProducts(), getStoreNews()]);
  const staticLastModified = new Date("2026-04-23T00:00:00.000Z");
  const homeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "daily";
  const standardFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly";
  const articleFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly";
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/news",
    "/academy",
    "/agents",
    "/help",
    "/faq",
    "/refund-policy",
    "/purchase-terms",
    "/delivery"
  ].map((path) => ({
    url: getSiteUrl(path),
    lastModified: staticLastModified,
    changeFrequency: path === "" ? homeFrequency : standardFrequency,
    priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.7
  }));
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: getSiteUrl(`/products/${product.slug}`),
    lastModified: staticLastModified,
    changeFrequency: standardFrequency,
    priority: 0.8
  }));
  const newsEntries: MetadataRoute.Sitemap = news.map((article) => ({
    url: getSiteUrl(`/news/${article.slug}`),
    lastModified: new Date(article.publishedAt),
    changeFrequency: articleFrequency,
    priority: 0.6
  }));

  return [...staticEntries, ...productEntries, ...newsEntries];
}
