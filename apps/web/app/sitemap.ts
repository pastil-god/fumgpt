import type { MetadataRoute } from "next";
import { getStoreNews, getStoreProducts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([getStoreProducts(), getStoreNews()]);

  return [
    "",
    "/products",
    "/news",
    "/login",
    "/account",
    "/cart",
    "/academy",
    "/agents"
  ]
    .map((path) => ({
      url: `${siteConfig.siteUrl}${path}`,
      lastModified: new Date()
    }))
    .concat(
      products.map((product) => ({
        url: `${siteConfig.siteUrl}/products/${product.slug}`,
        lastModified: new Date()
      }))
    )
    .concat(
      news.map((article) => ({
        url: `${siteConfig.siteUrl}/news/${article.slug}`,
        lastModified: new Date(article.publishedAt)
      }))
    );
}
