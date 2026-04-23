import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AntiGravitySwirl } from "@/components/anti-gravity-swirl";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getStorefrontSettings } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const logoUrl = settings.logoUrl || "/logo.svg";

  return {
    applicationName: settings.brandName,
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.brandName}`
    },
    description: settings.siteDescription,
    metadataBase: new URL(siteConfig.siteUrl),
    referrer: "strict-origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false
    },
    alternates: {
      canonical: "/"
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      url: siteConfig.siteUrl,
      siteName: settings.brandName,
      locale: "fa_IR",
      type: "website",
      images: [
        {
          url: logoUrl,
          alt: settings.brandName
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [logoUrl]
    },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
      apple: "/icon.svg"
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f7fb"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const decorativeBackgroundMode = "static" as const;

  return (
    <html lang="fa" dir="rtl">
      <body>
        <a href="#main-content" className="skip-link">
          رد شدن و رفتن به محتوای اصلی
        </a>
        <AntiGravitySwirl mode={decorativeBackgroundMode} />
        <div className="app-shell">
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
