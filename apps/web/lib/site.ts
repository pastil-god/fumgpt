export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "FumGPT",
  title: "FumGPT | فروش حرفه‌ای اکانت و سرویس‌های هوش مصنوعی",
  description:
    "فروشگاه نسل جدید محصولات و سرویس‌های هوش مصنوعی با ظاهر حرفه‌ای، معماری آماده توسعه و مسیر باز برای آکادمی و بازارچه AI Agent.",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fumgpt.com",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "0900 000 0000",
  telegram: process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM || "https://t.me/fumgpt",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/fumgpt",
  nav: [
    { href: "/", label: "خانه" },
    { href: "/products", label: "محصولات" },
    { href: "/academy", label: "آکادمی" },
    { href: "/agents", label: "بازارچه ایجنت" },
    { href: "/login", label: "ورود" },
    { href: "/cart", label: "سبد خرید" }
  ],
  trustPills: [
    "تحویل دیجیتال",
    "پشتیبانی سریع",
    "پرداخت ریالی",
    "آماده توسعه فاز 2"
  ]
};
