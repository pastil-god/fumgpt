import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import type { HomePageContent } from "@/lib/mock-homepage";
import { siteConfig } from "@/lib/site";

type Props = {
  featured?: Product[];
  stats?: {
    productCount: number;
    activeCategoryCount: number;
    brandCount: number;
    maxDiscount: number;
  };
  content?: HomePageContent["hero"];
};

export function Hero({ featured, stats, content }: Props) {
  const heroContent = content;

  if (!stats) {
    return (
      <section className="hero-section">
        <div className="container hero-shell">
          <div className="hero-grid">
            <div className="hero-copy surface hero-copy-card">
              <div className="hero-badge-row">
                <div className="eyebrow">
                  {heroContent?.eyebrow || "فروشگاه حرفه‌ای سرویس‌های هوش مصنوعی"}
                </div>
                <span className="hero-status-pill">در حال بارگذاری</span>
              </div>

              <h1>
                {heroContent?.titleLead || "خرید حرفه‌ای سرویس‌های"}{" "}
                <span>{heroContent?.titleHighlight || "هوش مصنوعی"}</span>{" "}
                {heroContent?.titleTail || "با تجربه‌ای شبیه یک مارکت‌پلیس سطح بالا"}
              </h1>
              <p>
                {heroContent?.description ||
                  "اطلاعات هیرو هنوز آماده نشده است. چند لحظه دیگر دوباره تلاش کنید یا پس از بارگذاری داده‌ها، آمار و پیشنهادهای منتخب نمایش داده می‌شوند."}
              </p>
            </div>

            <div className="surface hero-market-card">
              <div className="hero-preview-header">
                <div>
                  <span className="preview-pill">نمای کلی فروشگاه</span>
                  <h2>ویترین منتخب در حال آماده‌سازی است</h2>
                </div>
              </div>

              <div className="launch-banner accent-grid">
                <div>
                  <small>در حال بارگذاری</small>
                  <strong>اطلاعات آماری و محصولات منتخب به‌زودی نمایش داده می‌شوند</strong>
                </div>
                <p>تا زمانی که داده‌ها آماده شوند، این بخش به‌صورت امن بدون خطا رندر می‌شود.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { productCount, activeCategoryCount, brandCount, maxDiscount } = stats;
  const safeFeatured = featured || [];
  const resolvedContent = heroContent || {
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
  };

  return (
    <section className="hero-section">
      <div className="container hero-shell">
        <div className="hero-grid">
          <div className="hero-copy surface hero-copy-card">
            <div className="hero-badge-row">
              <div className="eyebrow">{resolvedContent.eyebrow}</div>
              <span className="hero-status-pill">{resolvedContent.statusLabel}</span>
            </div>

            <h1>
              {resolvedContent.titleLead} <span>{resolvedContent.titleHighlight}</span>{" "}
              {resolvedContent.titleTail}
            </h1>
            <p>{resolvedContent.description}</p>

            <div className="hero-cta-row">
              <Link className="btn btn-primary btn-large" href={resolvedContent.primaryCtaHref}>
                {resolvedContent.primaryCtaLabel}
              </Link>
              <Link className="btn btn-secondary btn-large" href={resolvedContent.secondaryCtaHref}>
                {resolvedContent.secondaryCtaLabel}
              </Link>
            </div>

            <div className="hero-proof-strip">
              <div>
                <strong>{resolvedContent.proofTitle}</strong>
                <span>{resolvedContent.proofText}</span>
              </div>
              <Link className="chip chip-link" href={siteConfig.telegram}>
                گفت‌وگو در تلگرام
              </Link>
            </div>

            <div className="hero-trust-row">
              {siteConfig.trustPills.map((pill) => (
                <span key={pill} className="chip">
                  {pill}
                </span>
              ))}
            </div>

            <div className="hero-stats">
              <div className="stat-card stat-card-emphasis">
                <strong>{productCount}</strong>
                <span>محصول واقعی برای لانچ</span>
              </div>
              <div className="stat-card">
                <strong>{activeCategoryCount}</strong>
                <span>دسته‌بندی تخصصی و مرتب</span>
              </div>
              <div className="stat-card">
                <strong>{brandCount}</strong>
                <span>برند مطرح در ویترین</span>
              </div>
              <div className="stat-card">
                <strong>{maxDiscount}٪</strong>
                <span>بیشترین تخفیف فعلی</span>
              </div>
            </div>
          </div>

          <div className="surface hero-market-card">
            <div className="hero-preview-header">
              <div>
                <span className="preview-pill">نمای کلی فروشگاه</span>
                <h2>ویترین منتخب برای تصمیم‌گیری سریع</h2>
              </div>
              <div className="hero-score-card">
                <strong>{brandCount}+</strong>
                <span>برند قابل ارائه</span>
              </div>
            </div>

            <div className="hero-market-feature accent-grid">
              <div>
                <small>چشم‌انداز</small>
                <strong>ساختار لانچ آماده توسعه برای آکادمی و بازارچه ایجنت</strong>
                <p>
                  ویترین اصلی هم‌زمان برای فروش فوری، توسعه فاز دوم و اضافه شدن سرویس‌های حرفه‌ای طراحی شده است.
                </p>
              </div>
              <span className="hero-market-badge">کاتالوگ زنده</span>
            </div>

            <div className="mini-product-stack">
              {safeFeatured.length > 0 ? (
                safeFeatured.map((item) => (
                  <Link href={`/products/${item.slug}`} key={item.id} className="mini-product">
                    <div className={`mini-mark accent-${item.accent}`}>{item.coverLabel}</div>
                    <div className="mini-copy">
                      <strong>{item.title}</strong>
                      <span>{item.shortDescription}</span>
                      <small>
                        {item.badge} • {item.delivery}
                      </small>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="mini-product">
                  <div className="mini-copy">
                    <strong>محصولات منتخب در حال بارگذاری هستند</strong>
                    <span>پس از آماده شدن داده‌ها، پیشنهادهای ویژه اینجا نمایش داده می‌شوند.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="launch-banner accent-grid">
              <div>
                <small>اعتماد خرید</small>
                <strong>نشانه‌های اعتماد داخل همان اولین اسکرول</strong>
              </div>
              <ul className="feature-list-simple compact">
                <li>کاتالوگ واقعی فاز اول به‌جای داده نمایشی صرف</li>
                <li>CTA مستقیم برای مشاهده محصول و ورود به مسیر خرید</li>
                <li>چیدمان مناسب برای افزودن فروشنده، آکادمی و پلن‌های اشتراکی</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="hero-assurance-grid">
          <div className="surface hero-assurance-card">
            <small>تحویل و فعال‌سازی</small>
            <strong>سناریوهای تحویل متناسب با هر سرویس از ابتدا شفاف شده‌اند</strong>
            <p>از فعال‌سازی روی ایمیل شخصی تا تحویل دستی یا دیجیتال، وضعیت هر محصول روشن است.</p>
          </div>

          <div className="surface hero-assurance-card">
            <small>اعتماد خرید</small>
            <strong>پشتیبانی، مشاوره پیش از خرید و مسیر ارتباطی مستقیم در همان Hero دیده می‌شود</strong>
            <p>کاربر برای فهمیدن نحوه خرید یا اعتمادسازی لازم نیست چند بخش پایین‌تر اسکرول کند.</p>
          </div>

          <div className="surface hero-assurance-card">
            <small>جایگاه برند</small>
            <strong>هدر اصلی حالا بیشتر شبیه داشبورد یک فروشگاه حرفه‌ای هوش مصنوعی است</strong>
            <p>ترکیب متریک‌ها، شلف منتخب و پیام‌های اعتماد، حس برند و کیفیت را بالا می‌برد.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
