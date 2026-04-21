export type HomePageContent = {
  hero: {
    eyebrow: string;
    statusLabel: string;
    titleLead: string;
    titleHighlight: string;
    titleTail: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    proofTitle: string;
    proofText: string;
  };
  newsSection: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  announcement: {
    label: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export const homePageContent: HomePageContent = {
  hero: {
    eyebrow: "فروشگاه حرفه‌ای سرویس‌های هوش مصنوعی",
    statusLabel: "لانچ زنده با کاتالوگ واقعی",
    titleLead: "خرید حرفه‌ای سرویس‌های",
    titleHighlight: "هوش مصنوعی",
    titleTail: "با تجربه‌ای شبیه یک مارکت‌پلیس سطح بالا",
    description:
      "صفحه اصلی حالا به‌جای یک معرفی ساده، مثل ویترین یک فروشگاه حرفه‌ای رفتار می‌کند: دسته‌بندی واضح، پیشنهادهای منتخب، CTAهای روشن و نشانه‌های اعتماد برای خرید سریع‌تر و مطمئن‌تر.",
    primaryCtaLabel: "مشاهده محصولات منتخب",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "ورود به بازارچه ایجنت",
    secondaryCtaHref: "/agents",
    proofTitle: "مشاوره قبل از خرید",
    proofText: "برای انتخاب پلن مناسب، تحویل و فعال‌سازی سریع"
  },
  newsSection: {
    eyebrow: "اخبار",
    title: "آخرین خبرها و مقاله‌های فروشگاه",
    description:
      "این بخش برای انتشار سریع خبر، مقاله، آپدیت محصول و اطلاعیه‌های مهم از داخل CMS طراحی شده است.",
    ctaLabel: "همه خبرها"
  },
  announcement: {
    label: "آماده انتشار",
    title: "الان تمرکز روی لانچ پوسته و کاتالوگ واقعی است",
    description:
      "در این مرحله به‌جای درگیر شدن با درگاه و پیامک، ظاهر، ساختار و محصولات را روی دامنه جدید حرفه‌ای می‌کنیم تا فاز بعدی روی یک پایه تمیز سوار شود.",
    ctaLabel: "ورود به حساب کاربری",
    ctaHref: "/login"
  }
};
