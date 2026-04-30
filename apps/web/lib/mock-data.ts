export type ProductCategory = "ai-access" | "creative" | "coding" | "professional";
export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  brand: string;
  price: number;
  comparePrice: number;
  currency: "IRR";
  delivery: string;
  deliveryNote?: string;
  shortDescription: string;
  description: string;
  features: string[];
  notes: string[];
  badge: string;
  coverLabel: string;
  accent: "cyan" | "violet" | "amber" | "emerald";
  isFeatured?: boolean;
  status?: ProductStatus;
  imageUrl?: string;
  galleryImageUrls?: string[];
  videoUrl?: string;
  supportNote?: string;
  trustNote?: string;
  priority?: number;
  priceLabel?: string;
  ctaText?: string;
  ctaHref?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export const categories: Array<{
  key: ProductCategory | "all";
  label: string;
  description: string;
}> = [
  {
    key: "all",
    label: "همه محصولات",
    description: "کاتالوگ کامل فاز اول فروشگاه"
  },
  {
    key: "ai-access",
    label: "اکانت‌های AI",
    description: "ChatGPT، Gemini و سرویس‌های هوش مصنوعی"
  },
  {
    key: "creative",
    label: "خلاقیت و تولید محتوا",
    description: "Canva و CapCut برای طراحی و ویدئو"
  },
  {
    key: "coding",
    label: "کدنویسی و توسعه",
    description: "ابزارهای توسعه‌دهنده مثل Cursor"
  },
  {
    key: "professional",
    label: "حرفه‌ای و شغلی",
    description: "سرویس‌های رشد شغلی و برند شخصی"
  }
];

export const products: Product[] = [
  {
    id: "p-001",
    slug: "chatgpt-business-shared-3-seat",
    title: "اکانت اشتراکی ChatGPT Business سه نفر",
    category: "ai-access",
    brand: "OpenAI",
    price: 220000,
    comparePrice: 810000,
    currency: "IRR",
    delivery: "تحویل دیجیتال / سریع",
    shortDescription:
      "پلن اقتصادی برای دسترسی به امکانات نسخه Business با مدل اشتراکی سه‌نفره.",
    description:
      "این پلن برای شروع سریع و مقرون‌به‌صرفه طراحی شده و بر پایه محتوای فعلی سایت شما، امکانات نسخه Plus را همراه با برخی قابلیت‌های مهم Business در اختیار کاربر قرار می‌دهد.",
    features: [
      "دسترسی به امکانات نسخه Plus",
      "استفاده از مدل GPT-5.2 طبق توضیح فعلی محصول",
      "تحلیل فایل‌های Excel، CSV و نمودارها",
      "پنجره متنی بزرگ برای بررسی متن‌های طولانی",
      "استفاده از GPTs و ابزارهای تخصصی"
    ],
    notes: [
      "مدل اشتراکی سه‌نفره",
      "غیر قابل تمدید",
      "مناسب شروع سریع با هزینه کمتر"
    ],
    badge: "۷۳٪ تخفیف",
    coverLabel: "GPT BUSINESS",
    accent: "emerald",
    isFeatured: true
  },
  {
    id: "p-002",
    slug: "chatgpt-business-dedicated-1-month",
    title: "اکانت اختصاصی ChatGPT Business یک ماهه",
    category: "ai-access",
    brand: "OpenAI",
    price: 310000,
    comparePrice: 940000,
    currency: "IRR",
    delivery: "تحویل دیجیتال / سریع",
    shortDescription:
      "نسخه اختصاصی و از پیش‌ساخته برای کاربری شخصی‌تر با امکانات Business.",
    description:
      "بر اساس محتوای فعلی محصول در سایت شما، این پلن به‌صورت اکانت آماده اختصاصی ارائه می‌شود و روی ویژگی‌هایی مثل حفظ حریم خصوصی، تحلیل داده و پنجره متنی بالا تمرکز دارد.",
    features: [
      "اکانت آماده اختصاصی",
      "امکانات نسخه Plus به‌علاوه ویژگی‌های Business",
      "حفظ حریم خصوصی داده‌ها",
      "تحلیل پیشرفته فایل‌ها و داده‌ها",
      "دسترسی به GPTs تخصصی"
    ],
    notes: [
      "غیر قابل تمدید",
      "پلن یک‌ماهه",
      "تحویل دیجیتال"
    ],
    badge: "۶۸٪ تخفیف",
    coverLabel: "CHATGPT PRO",
    accent: "cyan",
    isFeatured: true
  },
  {
    id: "p-003",
    slug: "gemini-pro-family-group",
    title: "اکانت اختصاصی جمینای پرو Gemini",
    category: "ai-access",
    brand: "Google",
    price: 370000,
    comparePrice: 800000,
    currency: "IRR",
    delivery: "فعال‌سازی روی ایمیل شما",
    shortDescription:
      "فعال‌سازی روی ایمیل شخصی با ساختار فمیلی‌گروپ و دسترسی به Gemini Advanced.",
    description:
      "طبق توضیحات فعلی سایت شما، این محصول به‌صورت عضویت در Family Group اختصاصی فعال می‌شود و امکانات پلن Google One AI Premium را روی ایمیل کاربر اضافه می‌کند.",
    features: [
      "دسترسی به Gemini Advanced",
      "استفاده از هوش مصنوعی در Gmail و Google Docs",
      "چت‌ها و اطلاعات شخصی طبق توضیح محصول اختصاصی باقی می‌مانند",
      "فعال‌سازی روی ایمیل خود کاربر",
      "مناسب برای نوشتن، تحلیل و کارهای روزمره"
    ],
    notes: [
      "برای ورود اولیه به VPN آمریکا نیاز دارد",
      "برای استفاده بعدی ابزار تغییر IP لازم است",
      "پلن مناسب کاربران گوگل‌محور"
    ],
    badge: "۵۴٪ تخفیف",
    coverLabel: "GEMINI ADV",
    accent: "violet",
    isFeatured: true
  },
  {
    id: "p-004",
    slug: "cursor-pro-1-month",
    title: "اکانت اختصاصی Cursor Pro یک ماهه",
    category: "coding",
    brand: "Cursor",
    price: 3600000,
    comparePrice: 3800000,
    currency: "IRR",
    delivery: "تحویل دستی / اختصاصی",
    shortDescription:
      "پلن کدنویسی برای کاربرانی که دسترسی اختصاصی به Cursor Pro می‌خواهند.",
    description:
      "در سایت فعلی شما برای این محصول قیمت و نام مشخص شده اما توضیح جزئیات کامل درج نشده است؛ در این فاز آن را به‌عنوان محصول اختصاصی توسعه‌دهنده‌ها روی سایت جدید می‌آوریم تا بعداً جزئیات نهایی تکمیل شود.",
    features: [
      "اکانت اختصاصی یک‌ماهه",
      "مناسب توسعه‌دهندگان و برنامه‌نویسان",
      "قابل تکمیل با جزئیات نهایی در فاز بعد",
      "چیدمان آماده برای مشخصات بیشتر"
    ],
    notes: [
      "تحویل اختصاصی",
      "نیازمند تکمیل توضیحات نهایی",
      "پلن ویژه دسته توسعه"
    ],
    badge: "۶٪ تخفیف",
    coverLabel: "CURSOR PRO",
    accent: "amber",
    isFeatured: true
  },
  {
    id: "p-005",
    slug: "canva-pro-6-month-private",
    title: "اشتراک ۶ ماهه Canva Pro (اکانت اختصاصی)",
    category: "creative",
    brand: "Canva",
    price: 350000,
    comparePrice: 630000,
    currency: "IRR",
    delivery: "فعال‌سازی اختصاصی",
    shortDescription:
      "پلن ۶ ماهه برای طراحان و تولیدکنندگان محتوا با دسترسی به ابزارهای Pro و AI.",
    description:
      "طبق اطلاعات فعلی سایت شما، این محصول به‌صورت اکانت اختصاصی عرضه می‌شود و روی دسترسی بدون وقفه، ابزارهای حرفه‌ای Canva و ضمانت ادامه سرویس تمرکز دارد.",
    features: [
      "دسترسی ۱۸۰ روزه به Canva Pro",
      "اکانت اختصاصی با امکان تغییر ایمیل و رمز عبور",
      "دسترسی به استوک، فونت و ابزارهای AI کنوا",
      "تمدید خودکار در طول دوره فعال",
      "تعهد جایگزینی اکانت تا ۲ ماه در صورت اختلال"
    ],
    notes: [
      "پلن اختصاصی",
      "مناسب طراحی و شبکه‌های اجتماعی",
      "تحویل دیجیتال"
    ],
    badge: "۴۵٪ تخفیف",
    coverLabel: "CANVA PRO",
    accent: "cyan",
    isFeatured: true
  },
  {
    id: "p-006",
    slug: "capcut-team-pro",
    title: "اکانت CapCut Team (نسخه Pro)",
    category: "creative",
    brand: "CapCut",
    price: 320000,
    comparePrice: 890000,
    currency: "IRR",
    delivery: "ارسال مشخصات اکانت آماده",
    shortDescription:
      "پلن تیمی CapCut برای تدوین‌گران و تولیدکننده‌های ویدئویی با دسترسی کامل به امکانات Pro.",
    description:
      "بر مبنای محتوای فعلی سایت شما، این محصول به شکل فضای تیمی اختصاصی ارائه می‌شود و امکانات Pro، فضای ابری و دسترسی روی چند دستگاه را فعال می‌کند.",
    features: [
      "دسترسی کامل به افکت‌ها، فیلترها و ترنزیشن‌های Pro",
      "قابل استفاده روی ۲ تا ۳ دستگاه",
      "سازگار با iOS، Android، Windows و macOS",
      "فضای ابری ۱ ترابایتی",
      "ورود دسکتاپ از طریق اسکن QR با اپ موبایل"
    ],
    notes: [
      "برای Browser CapCut فعال نیست",
      "به‌صورت اکانت آماده تحویل می‌شود",
      "مناسب تولیدکننده‌های ویدئو"
    ],
    badge: "۶۵٪ تخفیف",
    coverLabel: "CAPCUT TEAM",
    accent: "violet",
    isFeatured: true
  },
  {
    id: "p-007",
    slug: "linkedin-premium-exclusive",
    title: "اکانت اختصاصی پریمیوم لینکدین",
    category: "professional",
    brand: "LinkedIn",
    price: 5000000,
    comparePrice: 8500000,
    currency: "IRR",
    delivery: "تحویل اختصاصی / مشاوره‌محور",
    shortDescription:
      "سرویس حرفه‌ای برای رشد برند شخصی و حضور جدی‌تر در لینکدین.",
    description:
      "اطلاعات فعلی محصول در سایت شما بیشتر شبیه یک سرویس حرفه‌ای لینکدینی است تا صرفاً یک اشتراک ساده؛ بنابراین در طراحی جدید این مورد را به‌عنوان پلن حرفه‌ای برند شخصی و رشد ارتباطات نمایش می‌دهیم.",
    features: [
      "تقویم محتوایی اختصاصی",
      "ایده‌پردازی و تولید محتوای حرفه‌ای",
      "افزایش هدفمند ارتباطات و نتورکینگ",
      "گزارش رشد فالوور و تعامل",
      "مناسب برندسازی شغلی"
    ],
    notes: [
      "محصول حرفه‌ای و گران‌تر از بقیه",
      "مناسب فریلنسرها و مدیران",
      "نیازمند ارائه جزئیات تکمیلی در فاز بعد"
    ],
    badge: "۴۲٪ تخفیف",
    coverLabel: "LINKEDIN +",
    accent: "amber",
    isFeatured: true
  }
];

export function getFeaturedProducts(limit?: number) {
  const featured = products.filter((item) => item.isFeatured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export function getProductBySlug(slug: string) {
  return products.find((item) => item.slug === slug);
}

export function filterProducts(category?: string) {
  if (!category || category === "all") {
    return products;
  }
  return products.filter((item) => item.category === category);
}

export function getRelatedProducts(category: ProductCategory, currentId: string) {
  return products.filter((item) => item.category === category && item.id !== currentId).slice(0, 3);
}

export function getCategoryMeta(key: string) {
  return categories.find((item) => item.key === key);
}

export function formatPriceIRR(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export function getDiscountPercent(comparePrice: number, price: number) {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
