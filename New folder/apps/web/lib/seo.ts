import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  type?: "website" | "article";
};

export function buildPublicMetadata(input: PublicMetadataInput): Metadata {
  const imagePath = input.imagePath || "/icon.svg";

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: getSiteUrl(input.path),
      siteName: siteConfig.name,
      locale: "fa_IR",
      type: input.type || "website",
      images: [
        {
          url: imagePath,
          alt: input.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imagePath]
    }
  };
}
