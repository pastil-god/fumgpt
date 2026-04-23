import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account", "/login", "/cart", "/checkout", "/api/"]
      }
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`
  };
}
