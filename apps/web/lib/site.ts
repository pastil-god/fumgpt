export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "FumGPT",
  title: "FumGPT | فروش حرفه‌ای اکانت و سرویس‌های هوش مصنوعی",
  description:
    "فروشگاه نسل جدید محصولات و سرویس‌های هوش مصنوعی با ظاهر حرفه‌ای، معماری آماده توسعه و مسیر باز برای آکادمی و بازارچه ایجنت.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fumgpt.com",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "0900 000 0000",
  telegram: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/fumgpt",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/fumgpt",
  cmsDashboardUrl: process.env.NEXT_PUBLIC_CMS_DASHBOARD_URL || "",
  nav: [
    { href: "/", label: "خانه" },
    { href: "/products", label: "فروشگاه" },
    { href: "/news", label: "اخبار" },
    { href: "/academy", label: "آکادمی" },
    { href: "/agents", label: "بازارچه ایجنت" }
  ],
  trustPills: [
    "تحویل دیجیتال",
    "پشتیبانی پاسخ‌گو",
    "کاتالوگ واقعی",
    "آماده توسعه فاز 2"
  ]
};
