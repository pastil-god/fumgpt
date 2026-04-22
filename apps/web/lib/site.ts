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
  trustBadges: string[];
  navigation: NavigationLink[];
};

const fallbackBrandName = process.env.NEXT_PUBLIC_BRAND_NAME || "FumGPT";
const fallbackSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const fallbackStorefrontSettings: StorefrontSettings = {
  brandName: fallbackBrandName,
  siteTitle: `${fallbackBrandName} | فروشگاه فارسی سرویس‌های هوش مصنوعی`,
  siteDescription:
    "فروشگاه فارسی محصولات و سرویس‌های هوش مصنوعی با تجربه خرید روشن، محتوای CMS-محور و مسیر آماده برای لانچ عمومی.",
  brandTagline: "بازار فارسی سرویس‌های دیجیتال و ابزارهای هوش مصنوعی",
  topBarText: "فروشگاه روشن و آماده مدیریت برای تیم‌های محتوایی و فروش",
  topBarHighlights: ["تحویل دیجیتال", "پشتیبانی فارسی", "مدیریت آسان محتوا"],
  support: {
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "0900 000 0000",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fumgpt.com",
    address:
      process.env.NEXT_PUBLIC_SUPPORT_ADDRESS ||
      "پاسخ‌گویی آنلاین، هماهنگی از طریق تلگرام و تحویل دیجیتال در سراسر ایران",
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
      "FumGPT برای فروش حرفه‌ای محصولات دیجیتال، خبرها و محتوای قابل‌مدیریت ساخته شده تا تیم فروش و محتوا بدون تغییر کد، ویترین را به‌روز نگه دارند.",
    copyright: `© ${new Date().getFullYear()} ${fallbackBrandName}. همه حقوق محفوظ است.`
  },
  trustBadges: ["تحویل دیجیتال", "پشتیبانی فارسی", "قیمت‌گذاری شفاف", "مدیریت آسان محتوا"],
  navigation: [
    { label: "خانه", href: "/", location: "both", priority: 100 },
    { label: "فروشگاه", href: "/products", location: "both", priority: 90 },
    { label: "اخبار", href: "/news", location: "both", priority: 80 },
    { label: "آکادمی", href: "/academy", location: "footer", priority: 70 },
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
