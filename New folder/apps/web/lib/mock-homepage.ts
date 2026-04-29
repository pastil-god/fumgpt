export type HomePageSection = {
  isVisible: boolean;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomePageTrustSection = {
  isVisible: boolean;
  eyebrow: string;
  title: string;
  points: string[];
};

export type HomePageRoadmapSection = {
  isVisible: boolean;
  eyebrow: string;
  title: string;
  phases: Array<{
    title: string;
    description: string;
  }>;
};

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
    quickStartTitle: string;
    quickStartText: string;
    marketLabel: string;
    marketTitle: string;
    marketDescription: string;
    marketBadge: string;
  };
  categorySection: HomePageSection;
  featuredSection: HomePageSection;
  newsSection: HomePageSection & {
    adminCalloutLabel: string;
    adminCalloutTitle: string;
    adminCalloutDescription: string;
  };
  trustSection: HomePageTrustSection;
  roadmapSection: HomePageRoadmapSection;
  announcement: {
    isVisible: boolean;
    label: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export const homePageContent: HomePageContent = {
  hero: {
    eyebrow: "بازار فارسی ابزارهای هوش مصنوعی",
    statusLabel: "خرید شفاف، تحویل دیجیتال، پشتیبانی انسانی",
    titleLead: "ابزارهای AI را",
    titleHighlight: "سریع‌تر، مطمئن‌تر",
    titleTail: "و با راهنمایی فارسی تهیه کن",
    description:
      "FumGPT یک ویترین تخصصی برای انتخاب و سفارش سرویس‌های هوش مصنوعی است؛ از اکانت‌های کاربردی تا ابزارهای خلاقیت، برنامه‌نویسی و بهره‌وری، با مسیر سفارش قابل پیگیری.",
    primaryCtaLabel: "مشاهده فروشگاه",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "راهنمای انتخاب",
    secondaryCtaHref: "/academy",
    proofTitle: "قبل از خرید تنها نیستی",
    proofText: "برای انتخاب پلن مناسب، وضعیت تحویل و پیگیری سفارش، پشتیبانی فارسی کنار توست.",
    quickStartTitle: "از نیازت شروع کن",
    quickStartText: "اکانت شخصی، ابزار تیمی، تولید محتوا، کدنویسی یا آموزش؛ دسته‌بندی‌ها کمک می‌کنند سریع‌تر به گزینه درست برسی.",
    marketLabel: "AI Storefront",
    marketTitle: "یک ویترین تمیز برای سرویس‌های پرتقاضای AI",
    marketDescription:
      "محصولات منتخب، قیمت شفاف، جزئیات تحویل و مسیر سفارش در یک تجربه ساده و قابل اعتماد کنار هم قرار گرفته‌اند.",
    marketBadge: "آماده سفارش"
  },
  categorySection: {
    isVisible: true,
    eyebrow: "دسته‌بندی‌ها",
    title: "برای هر نیاز، یک مسیر خرید روشن",
    description:
      "دسته‌ها طوری چیده شده‌اند که کاربر بدون سردرگمی بین سرویس‌های اشتراکی، ابزارهای خلاقیت، آموزش و محصولات حرفه‌ای حرکت کند.",
    ctaLabel: "مشاهده همه محصولات",
    ctaHref: "/products"
  },
  featuredSection: {
    isVisible: true,
    eyebrow: "محصولات منتخب",
    title: "پیشنهادهای قابل اعتماد برای شروع",
    description:
      "محصولاتی که برای استفاده روزمره، تیمی یا حرفه‌ای بیشتر درخواست می‌شوند، با توضیح کوتاه، قیمت و مسیر سفارش مشخص نمایش داده شده‌اند.",
    ctaLabel: "همه محصولات",
    ctaHref: "/products"
  },
  newsSection: {
    isVisible: true,
    eyebrow: "راهنما و به‌روزرسانی",
    title: "برای خرید بهتر، آگاه‌تر تصمیم بگیر",
    description:
      "خبرها، آموزش‌ها و نکته‌های کاربردی کمک می‌کنند قبل از سفارش، تفاوت ابزارها و کاربرد هر سرویس را بهتر بشناسی.",
    ctaLabel: "مشاهده همه مطالب",
    ctaHref: "/news",
    adminCalloutLabel: "مرکز محتوا",
    adminCalloutTitle: "محتوای آموزشی و خبرها می‌توانند با CMS یا پنل داخلی به‌روزرسانی شوند",
    adminCalloutDescription:
      "برای رشد محصول، خبرها و مقاله‌ها باید سریع و بدون deployهای غیرضروری قابل انتشار باشند."
  },
  trustSection: {
    isVisible: true,
    eyebrow: "اعتماد در خرید دیجیتال",
    title: "چرا کاربران باید به FumGPT اعتماد کنند؟",
    points: [
      "مسیر سفارش روشن؛ از انتخاب محصول تا ثبت و پیگیری",
      "قیمت‌گذاری قابل فهم و نمایش تفاوت قیمت‌ها بدون ابهام",
      "پشتیبانی فارسی برای انتخاب، تحویل و پیگیری سفارش",
      "تمرکز روی سرویس‌های واقعی و پرکاربرد، نه فهرست شلوغ و بی‌کیفیت",
      "طراحی سبک و سریع برای موبایل و دسکتاپ"
    ]
  },
  roadmapSection: {
    isVisible: true,
    eyebrow: "مسیر رشد محصول",
    title: "از فروشگاه اشتراک تا بازار ابزارهای هوشمند",
    phases: [
      {
        title: "فروشگاه تخصصی",
        description: "کاتالوگ شفاف، سبد خرید، سفارش، پیگیری و پنل عملیات برای مدیریت فروش."
      },
      {
        title: "آکادمی و راهنما",
        description: "محتوای آموزشی برای انتخاب ابزار، کار با سرویس‌ها و استفاده حرفه‌ای‌تر از AI."
      },
      {
        title: "API و Agent Marketplace",
        description: "در فازهای بعدی، فروش API و بازارچه ایجنت‌ها روی همین هسته قابل توسعه اضافه می‌شوند."
      }
    ]
  },
  announcement: {
    isVisible: true,
    label: "نیاز به راهنمایی داری؟",
    title: "قبل از سفارش می‌توانی از پشتیبانی راهنمای انتخاب بگیری",
    description:
      "اگر بین چند سرویس مردد هستی یا نمی‌دانی کدام پلن برای کارت مناسب‌تر است، از مسیر پشتیبانی راهنمایی بگیر و بعد سفارش را ثبت کن.",
    ctaLabel: "ورود و شروع سفارش",
    ctaHref: "/login"
  }
};
