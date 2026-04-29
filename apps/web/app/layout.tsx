import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/700.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/700.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/almarai/400.css";
import "@fontsource/almarai/700.css";
import "@fontsource/changa/400.css";
import "@fontsource/changa/700.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource/lalezar/400.css";
import "@fontsource/markazi-text/400.css";
import "@fontsource/markazi-text/700.css";
import "./globals.css";
import { AntiGravitySwirl } from "@/components/anti-gravity-swirl";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getStorefrontSettings } from "@/lib/content";
import { getInlineFontFamilyFallback } from "@/lib/settings/inline-homepage";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const logoUrl = settings.logoUrl || "/logo.svg";
  const iconUrl = settings.faviconUrl || "/icon.svg";

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
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f7fb"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const decorativeBackgroundMode = "static" as const;
  const settings = await getStorefrontSettings();
  const themeStyle = {
    "--color-accent": settings.appearance.primaryColor,
    "--color-accent-hover": settings.appearance.primaryColor,
    "--accent-purple": settings.appearance.secondaryColor,
    "--primary": settings.appearance.primaryColor,
    "--primary-strong": settings.appearance.primaryColor,
    "--font-ui": getInlineFontFamilyFallback(settings.appearance.fontFamily)
  } as CSSProperties;

  return (
    <html lang="fa" dir="rtl">
      <body style={themeStyle}>
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
