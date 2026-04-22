export type HomePageSection = {
  isVisible: boolean;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
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
    eyebrow: "بازار فارسی سرویس‌های هوش مصنوعی",
    statusLabel: "ویترین آماده خرید و مدیریت روزانه",
    titleLead: "خرید سرویس‌های",
    titleHighlight: "هوش مصنوعی",
    titleTail: "با تجربه‌ای روشن، فارسی و قابل‌اعتماد",
    description:
      "FumGPT یک ویترین سبک و حرفه‌ای برای فروش محصولات دیجیتال است تا تیم شما بتواند محصولات، خبرها و بنرهای اصلی را بدون نیاز به کدنویسی مدیریت کند.",
    primaryCtaLabel: "ورود به فروشگاه",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "خبرها و به‌روزرسانی‌ها",
    secondaryCtaHref: "/news",
    proofTitle: "همراهی قبل از خرید",
    proofText: "پشتیبانی فارسی، تحویل دیجیتال و راهنمایی برای انتخاب پلن مناسب",
    quickStartTitle: "شروع سریع از دسته‌بندی‌های اصلی",
    quickStartText: "اکانت‌ها، ابزارهای پرتقاضا، سرویس‌های تیمی و مسیرهای آموزشی در یک ویترین مرتب و خوانا",
    marketLabel: "ویترین امروز",
    marketTitle: "مرور سریع محصولات منتخب و دسته‌های پرتقاضا",
    marketDescription:
      "این بنر برای معرفی روزانه پیشنهادهای مهم، مزیت‌های فروشگاه و CTAهای اصلی طراحی شده و از CMS قابل ویرایش است.",
    marketBadge: "آماده سفارش"
  },
  categorySection: {
    isVisible: true,
    eyebrow: "دسته‌بندی‌های اصلی",
    title: "از دسته دلخواهت وارد فروشگاه شو",
    description:
      "تب‌های اصلی و کارت‌های دسته‌بندی برای مرور سریع‌تر چیده شده‌اند تا کاربر در همان اسکرول اول به بخش مناسب خودش برسد.",
    ctaLabel: "مشاهده همه محصولات",
    ctaHref: "/products"
  },
  featuredSection: {
    isVisible: true,
    eyebrow: "محصولات منتخب امروز",
    title: "پیشنهادهای ویژه FumGPT",
    description:
      "این بخش برای نمایش محصولات featured طراحی شده و تیم شما می‌تواند از CMS مشخص کند کدام پیشنهادها در ویترین اصلی دیده شوند.",
    ctaLabel: "همه محصولات",
    ctaHref: "/products"
  },
  newsSection: {
    isVisible: true,
    eyebrow: "اخبار",
    title: "آخرین خبرها و مقاله‌های فروشگاه",
    description:
      "به‌روزرسانی محصولات، خبرهای جدید و اطلاعیه‌های مهم فروشگاه از طریق CMS منتشر می‌شوند و همین‌جا در دسترس کاربران قرار می‌گیرند.",
    ctaLabel: "مشاهده همه خبرها",
    ctaHref: "/news",
    adminCalloutLabel: "مدیریت محتوا",
    adminCalloutTitle: "خبرها، بنرها و محتوای اصلی فروشگاه را بدون کدنویسی به‌روزرسانی کن",
    adminCalloutDescription:
      "مدیر محتوا می‌تواند از داشبورد Contentful خبر، تصویر، ویدئو و متن بخش‌های اصلی را ویرایش کند و همان روز در سایت منتشر ببیند."
  },
  announcement: {
    isVisible: true,
    label: "پشتیبانی و هماهنگی",
    title: "برای انتخاب محصول یا هماهنگی خرید، مستقیم با تیم پشتیبانی در ارتباط باش",
    description:
      "این نوار پایین صفحه اصلی برای متن‌های پشتیبانی، کمک خرید، اطلاعیه‌های ویژه و CTAهای بازاریابی در نظر گرفته شده است.",
    ctaLabel: "ورود به حساب کاربری",
    ctaHref: "/login"
  }
};
