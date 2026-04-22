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

function HeroSupportLink({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a className="chip chip-link" href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link className="chip chip-link" href={href}>
      {label}
    </Link>
  );
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
    <Link className={className} href={href}>
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
  const heroTrustBadges = resolvedStorefront.trustBadges.slice(0, 3);

  if (!stats) {
    return (
      <section className="hero-section">
        <div className="container hero-shell">
          <div className="hero-grid">
            <div className="hero-copy surface hero-copy-card">
              <div className="hero-copy-main">
                <div className="hero-badge-row">
                  <div className="eyebrow">{resolvedContent.eyebrow}</div>
                  <span className="hero-status-pill">در حال بارگذاری</span>
                </div>

                <div className="hero-copy-intro">
                  <h1>
                    {resolvedContent.titleLead} <span>{resolvedContent.titleHighlight}</span>{" "}
                    {resolvedContent.titleTail}
                  </h1>
                  <p>{resolvedContent.description}</p>
                </div>
              </div>

              <div className="hero-secondary-grid">
                <div className="hero-search">
                  <div>
                    <strong>{resolvedContent.quickStartTitle}</strong>
                    <span>{resolvedContent.quickStartText}</span>
                  </div>
                  <Link className="chip chip-link" href="/products" prefetch={false}>
                    مرور فروشگاه
                  </Link>
                </div>
              </div>
            </div>

            <div className="surface hero-market-card">
              <div className="hero-preview-header">
                <div>
                  <span className="preview-pill">{resolvedContent.marketLabel}</span>
                  <h2>{resolvedContent.marketTitle}</h2>
                </div>
              </div>

              <div className="hero-market-feature">
                <div>
                  <small>{resolvedContent.marketLabel}</small>
                  <strong>{resolvedContent.marketDescription}</strong>
                </div>
                <span className="hero-market-badge">{resolvedContent.marketBadge}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { productCount, activeCategoryCount, brandCount, maxDiscount } = stats;
  const safeFeatured = (featured || []).slice(0, 2);

  return (
    <section className="hero-section">
      <div className="container hero-shell">
        <div className="hero-grid">
          <div className="hero-copy surface hero-copy-card">
            <div className="hero-copy-main">
              <div className="hero-badge-row">
                <div className="eyebrow">{resolvedContent.eyebrow}</div>
                <span className="hero-status-pill">{resolvedContent.statusLabel}</span>
              </div>

              <div className="hero-copy-intro">
                <h1>
                  {resolvedContent.titleLead} <span>{resolvedContent.titleHighlight}</span>{" "}
                  {resolvedContent.titleTail}
                </h1>
                <p>{resolvedContent.description}</p>
              </div>
            </div>

            <div className="hero-cta-row">
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

            <div className="hero-secondary-grid">
              <div className="hero-search">
                <div>
                  <strong>{resolvedContent.quickStartTitle}</strong>
                  <span>{resolvedContent.quickStartText}</span>
                </div>
                <Link className="chip chip-link" href="/products" prefetch={false}>
                  همه دسته‌ها
                </Link>
              </div>

              <div className="hero-proof-strip">
                <div>
                  <strong>{resolvedContent.proofTitle}</strong>
                  <span>{resolvedContent.proofText}</span>
                </div>
                <HeroSupportLink
                  href={resolvedStorefront.support.helpCtaHref}
                  label={resolvedStorefront.support.helpCtaLabel}
                />
              </div>
            </div>

            <div className="hero-trust-row">
              {heroTrustBadges.map((pill) => (
                <span key={pill} className="chip">
                  {pill}
                </span>
              ))}
            </div>

            <div className="hero-stats">
              <div className="stat-card stat-card-emphasis">
                <strong>{formatStat(productCount)}</strong>
                <span>محصول آماده نمایش در فروشگاه</span>
              </div>
              <div className="stat-card">
                <strong>{formatStat(activeCategoryCount)}</strong>
                <span>دسته‌بندی اصلی برای شروع سریع</span>
              </div>
              <div className="stat-card">
                <strong>{formatStat(brandCount)}</strong>
                <span>برند و سرویس قابل ارائه</span>
              </div>
              <div className="stat-card">
                <strong>{formatStat(maxDiscount)}٪</strong>
                <span>بیشترین تخفیف فعال فروشگاه</span>
              </div>
            </div>
          </div>

          <div className="surface hero-market-card">
            <div className="hero-preview-header">
              <div>
                <span className="preview-pill">{resolvedContent.marketLabel}</span>
                <h2>{resolvedContent.marketTitle}</h2>
              </div>
              <div className="hero-score-card">
                <strong>{formatStat(brandCount)}+</strong>
                <span>برند قابل ارائه</span>
              </div>
            </div>

            <div className="hero-market-feature">
              <div>
                <small>انتخاب سریع</small>
                <strong>{resolvedContent.marketDescription}</strong>
              </div>
              <span className="hero-market-badge">{resolvedContent.marketBadge}</span>
            </div>

            <div className="mini-product-stack">
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
                    <strong>محصولات منتخب در حال بارگذاری هستند</strong>
                    <span>پس از آماده شدن داده‌ها، پیشنهادهای ویژه این بخش به‌صورت خودکار نمایش داده می‌شوند.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="launch-banner">
              <div>
                <small>{resolvedContent.proofTitle}</small>
                <strong>{resolvedContent.proofText}</strong>
              </div>
              <ul className="feature-list-simple compact">
                {heroTrustBadges.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="hero-assurance-grid deferred-block">
          <div className="surface hero-assurance-card">
            <small>تحویل و فعال‌سازی</small>
            <strong>نحوه تحویل هر سرویس شفاف و قابل‌فهم نمایش داده می‌شود</strong>
            <p>از فعال‌سازی روی ایمیل شخصی تا تحویل دستی یا دیجیتال، مسیر هر محصول از ابتدا روشن است.</p>
          </div>

          <div className="surface hero-assurance-card">
            <small>اعتماد خرید</small>
            <strong>پشتیبانی فارسی و راه ارتباطی مستقیم در همان اسکرول اول دیده می‌شود</strong>
            <p>کاربر بدون جست‌وجوی اضافه می‌فهمد از کجا شروع کند، چطور خرید را پیگیری کند و با چه مسیری جلو برود.</p>
          </div>

          <div className="surface hero-assurance-card">
            <small>هویت برند</small>
            <strong>FumGPT حالا بیشتر شبیه یک بازار دیجیتال ایرانی تمیز و آماده رشد دیده می‌شود</strong>
            <p>چیدمان روشن، کارت‌های منظم و سلسله‌مراتب بهتر، حس یک فروشگاه حرفه‌ای و قابل اعتماد را تقویت می‌کند.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
