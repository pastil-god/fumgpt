export type NavigationLocation = "primary" | "footer" | "both";

export type NavigationLink = {
  label: string;
  href: string;
  location?: NavigationLocation;
  openInNewTab?: boolean;
  priority?: number;
};

export type StorefrontSettings = {
  brandName: string;
  siteTitle: string;
  siteDescription: string;
  brandTagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  topBarText: string;
  topBarHighlights: string[];
  support: {
    phone: string;
    email: string;
    address: string;
    helpCtaLabel: string;
    helpCtaHref: string;
  };
  socials: {
    telegram: string;
    instagram: string;
    whatsapp: string;
  };
  footer: {
    description: string;
    copyright: string;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  trustBadges: string[];
  navigation: NavigationLink[];
};

const fallbackBrandName = process.env.NEXT_PUBLIC_BRAND_NAME || "FumGPT";
const fallbackSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const fallbackStorefrontSettings: StorefrontSettings = {
  brandName: fallbackBrandName,
  siteTitle: `${fallbackBrandName} | بازار فارسی ابزارهای هوش مصنوعی`,
  siteDescription:
    "بازار فارسی ابزارها و سرویس‌های هوش مصنوعی با خرید شفاف، تحویل دیجیتال، پشتیبانی انسانی و سفارش قابل پیگیری.",
  brandTagline: "بازار فارسی ابزارها و سرویس‌های هوش مصنوعی",
  faviconUrl: "/icon.svg",
  topBarText: "خرید شفاف ابزارهای AI با پشتیبانی فارسی و تحویل قابل پیگیری",
  topBarHighlights: ["تحویل دیجیتال", "پشتیبانی فارسی", "سفارش قابل پیگیری"],
  support: {
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "0900 000 0000",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fumgpt.com",
    address:
      process.env.NEXT_PUBLIC_SUPPORT_ADDRESS ||
      "پاسخ‌گویی آنلاین، هماهنگی از طریق پشتیبانی و تحویل دیجیتال در سراسر ایران",
    helpCtaLabel: "مشاوره و هماهنگی خرید",
    helpCtaHref:
      process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM ||
      process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ||
      "https://t.me/fumgpt"
  },
  socials: {
    telegram: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/fumgpt",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/fumgpt",
    whatsapp:
      process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ||
      process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM ||
      "https://wa.me/989000000000"
  },
  footer: {
    description:
      "FumGPT ویترین فارسی ابزارهای هوش مصنوعی است؛ با خرید شفاف، پشتیبانی انسانی و مسیر سفارش قابل پیگیری.",
    copyright: `© ${new Date().getFullYear()} ${fallbackBrandName}. همه حقوق محفوظ است.`
  },
  appearance: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#1a73e8",
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#8c6bff",
    fontFamily: "\"Vazirmatn\", \"Inter\", system-ui, sans-serif"
  },
  trustBadges: ["تحویل دیجیتال", "پشتیبانی فارسی", "قیمت‌گذاری شفاف", "سفارش قابل پیگیری"],
  navigation: [
    { label: "خانه", href: "/", location: "both", priority: 100 },
    { label: "فروشگاه", href: "/products", location: "both", priority: 90 },
    { label: "آکادمی", href: "/academy", location: "both", priority: 85 },
    { label: "آموزش", href: "/academy#learning-path", location: "primary", priority: 84 },
    { label: "اخبار", href: "/news", location: "both", priority: 80 },
    { label: "بازارچه ایجنت", href: "/agents", location: "footer", priority: 60 }
  ]
};

export const siteConfig = {
  name: fallbackStorefrontSettings.brandName,
  title: fallbackStorefrontSettings.siteTitle,
  description: fallbackStorefrontSettings.siteDescription,
  siteUrl: fallbackSiteUrl,
  cmsDashboardUrl: process.env.NEXT_PUBLIC_CMS_DASHBOARD_URL || ""
};

export function isExternalHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(href);
}

export function getNavigationLinks(
  navigation: NavigationLink[],
  location: Exclude<NavigationLocation, "both">
) {
  return navigation.filter((item) => {
    const itemLocation = item.location || "both";
    return itemLocation === location || itemLocation === "both";
  });
}

export function getSortedNavigationLinks(navigation: NavigationLink[]) {
  return [...navigation].sort((left, right) => (right.priority || 0) - (left.priority || 0));
}

export function getSiteUrl(path = "/") {
  return new URL(path, fallbackSiteUrl).toString();
}
