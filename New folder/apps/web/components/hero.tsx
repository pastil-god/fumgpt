import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { homePageContent, type HomePageContent } from "@/lib/mock-homepage";
import { fallbackStorefrontSettings, isExternalHref, type StorefrontSettings } from "@/lib/site";

type Props = {
  featured?: Product[];
  stats?: {
    productCount: number;
    activeCategoryCount: number;
    brandCount: number;
    maxDiscount: number;
  };
  content?: HomePageContent["hero"];
  storefront?: Pick<StorefrontSettings, "trustBadges" | "support">;
};

function formatStat(value: number) {
  return value.toLocaleString("fa-IR");
}

function HeroAction({
  href,
  label,
  className
}: {
  href: string;
  label: string;
  className: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className={className} href={href} prefetch={false}>
      {label}
    </Link>
  );
}

export function Hero({ featured, stats, content, storefront }: Props) {
  const resolvedStorefront = storefront || {
    trustBadges: fallbackStorefrontSettings.trustBadges,
    support: fallbackStorefrontSettings.support
  };
  const resolvedContent = content || homePageContent.hero;
  const heroTrustBadges = resolvedStorefront.trustBadges.slice(0, 4);
  const safeFeatured = (featured || []).slice(0, 3);
  const productCount = stats?.productCount || 0;
  const activeCategoryCount = stats?.activeCategoryCount || 0;
  const brandCount = stats?.brandCount || 0;
  const maxDiscount = stats?.maxDiscount || 0;

  return (
    <section className="hero-section premium-hero-section">
      <div className="container hero-shell premium-hero-shell">
        <div className="premium-hero-grid">
          <div className="hero-copy surface hero-copy-card premium-hero-copy">
            <div className="hero-copy-main">
              <div className="hero-badge-row">
                <div className="eyebrow">{resolvedContent.eyebrow}</div>
                <span className="hero-status-pill">{resolvedContent.statusLabel}</span>
              </div>

              <div className="hero-copy-intro premium-hero-intro">
                <h1>
                  {resolvedContent.titleLead} <span>{resolvedContent.titleHighlight}</span>{" "}
                  {resolvedContent.titleTail}
                </h1>
                <p>{resolvedContent.description}</p>
              </div>
            </div>

            <div className="hero-cta-row premium-hero-cta">
              <HeroAction
                className="btn btn-primary btn-large"
                href={resolvedContent.primaryCtaHref}
                label={resolvedContent.primaryCtaLabel}
              />
              <HeroAction
                className="btn btn-secondary btn-large"
                href={resolvedContent.secondaryCtaHref}
                label={resolvedContent.secondaryCtaLabel}
              />
            </div>

            <div className="premium-hero-trust-panel">
              <div>
                <strong>{resolvedContent.proofTitle}</strong>
                <p>{resolvedContent.proofText}</p>
              </div>
              <div className="hero-trust-row">
                {heroTrustBadges.map((pill) => (
                  <span key={pill} className="chip">
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-stats premium-hero-stats">
              <div className="stat-card stat-card-emphasis">
                <strong>{formatStat(productCount)}</strong>
                <span>محصول قابل سفارش</span>
              </div>
              <div className="stat-card">
                <strong>{formatStat(activeCategoryCount)}</strong>
                <span>مسیر خرید اصلی</span>
              </div>
              <div className="stat-card">
                <strong>{formatStat(brandCount)}+</strong>
                <span>برند و سرویس</span>
              </div>
              <div className="stat-card">
                <strong>{formatStat(maxDiscount)}٪</strong>
                <span>بیشترین تخفیف</span>
              </div>
            </div>
          </div>

          <aside className="surface hero-market-card premium-hero-visual-card" aria-label="نمای تصویری فروشگاه AI">
            <div className="hero-preview-header premium-hero-visual-header">
              <div>
                <span className="preview-pill">{resolvedContent.marketLabel}</span>
                <h2>{resolvedContent.marketTitle}</h2>
              </div>
              <span className="hero-market-badge">{resolvedContent.marketBadge}</span>
            </div>

            <div className="premium-hero-illustration">
              <Image
                src="/illustrations/hero-ai-marketplace.svg"
                alt="نمای انتزاعی بازار ابزارهای هوش مصنوعی"
                width={780}
                height={585}
                priority
              />
              <div className="premium-floating-card premium-floating-card-top">
                <strong>{formatStat(productCount)} محصول</strong>
                <span>برای نیازهای AI</span>
              </div>
              <div className="premium-floating-card premium-floating-card-bottom">
                <strong>سفارش شفاف</strong>
                <span>تحویل و پیگیری روشن</span>
              </div>
            </div>

            <div className="hero-market-feature premium-market-note">
              <div>
                <small>{resolvedContent.quickStartTitle}</small>
                <strong>{resolvedContent.quickStartText}</strong>
              </div>
            </div>

            <div className="mini-product-stack premium-mini-products">
              {safeFeatured.length > 0 ? (
                safeFeatured.map((item) => (
                  <Link href={`/products/${item.slug}`} key={item.id} className="mini-product" prefetch={false}>
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
                    <strong>محصولات منتخب آماده نمایش هستند</strong>
                    <span>پس از انتخاب محصول featured، پیشنهادها در این قسمت دیده می‌شوند.</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="hero-assurance-grid deferred-block premium-assurance-grid">
          <div className="surface hero-assurance-card">
            <small>شفافیت خرید</small>
            <strong>قبل از ثبت سفارش می‌دانی چه چیزی می‌خری و چطور تحویل می‌گیری</strong>
            <p>هر محصول با توضیح، قیمت، وضعیت تحویل و مسیر پیگیری مشخص نمایش داده می‌شود.</p>
          </div>

          <div className="surface hero-assurance-card">
            <small>پشتیبانی انسانی</small>
            <strong>برای انتخاب سرویس مناسب، راهنمایی فارسی در دسترس است</strong>
            <p>کاربر می‌تواند قبل از خرید درباره پلن، کاربرد و زمان تحویل سؤال کند.</p>
          </div>

          <div className="surface hero-assurance-card">
            <small>آماده رشد</small>
            <strong>هسته فروشگاه برای آکادمی، API و بازارچه ایجنت‌ها قابل توسعه است</strong>
            <p>ساختار محصولی ساده نگه داشته شده تا فازهای بعدی بدون بازنویسی سنگین اضافه شوند.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
