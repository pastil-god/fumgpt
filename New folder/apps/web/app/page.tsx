import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { NewsSection } from "@/components/news-section";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import {
  getFeaturedStoreProducts,
  getHeroStats,
  getHomePageContent,
  getStoreCategoryCounts,
  getStoreNews,
  getStorefrontSettings
} from "@/lib/content";
import { buildPublicMetadata } from "@/lib/seo";
import { isExternalHref } from "@/lib/site";

export const metadata: Metadata = buildPublicMetadata({
  title: "فروشگاه هوش مصنوعی فارسی",
  description:
    "خرید شفاف محصولات و سرویس‌های هوش مصنوعی با محتوای فارسی، پشتیبانی روشن و مسیر سفارش واقعی.",
  path: "/"
});

function PageAction({
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
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default async function HomePage() {
  const [featuredProducts, newsArticles, categoryCounts, heroStats, homePageContent, storefrontSettings] =
    await Promise.all([
      getFeaturedStoreProducts(),
      getStoreNews(),
      getStoreCategoryCounts(),
      getHeroStats(),
      getHomePageContent(),
      getStorefrontSettings()
    ]);

  return (
    <div className="homepage-shell">
      <AnalyticsPageView
        name="homepage_view"
        route="/"
        path="/"
        metadata={{
          featuredProductCount: featuredProducts.length,
          newsArticleCount: newsArticles.length,
          categoryCount: categoryCounts.length
        }}
      />
      <Hero
        featured={featuredProducts.slice(0, 4)}
        stats={heroStats}
        content={homePageContent.hero}
        storefront={storefrontSettings}
      />

      {homePageContent.categorySection.isVisible ? (
        <section className="section section-muted home-section home-section-categories deferred-section">
          <div className="container section-stack home-section-stack">
            <div className="section-header home-section-header">
              <div className="section-copy">
                <div className="eyebrow">{homePageContent.categorySection.eyebrow}</div>
                <h2 className="section-title">{homePageContent.categorySection.title}</h2>
                <p className="muted section-text">{homePageContent.categorySection.description}</p>
              </div>
              <PageAction
                href={homePageContent.categorySection.ctaHref}
                label={homePageContent.categorySection.ctaLabel}
                className="btn btn-secondary"
              />
            </div>

            <CategoryGrid items={categoryCounts} />
          </div>
        </section>
      ) : null}

      {homePageContent.featuredSection.isVisible ? (
        <section className="section home-section home-section-featured deferred-section">
          <div className="container section-stack home-section-stack">
            <div className="section-header home-section-header">
              <div className="section-copy">
                <div className="eyebrow">{homePageContent.featuredSection.eyebrow}</div>
                <h2 className="section-title">{homePageContent.featuredSection.title}</h2>
                <p className="muted section-text">{homePageContent.featuredSection.description}</p>
              </div>
              <PageAction
                href={homePageContent.featuredSection.ctaHref}
                label={homePageContent.featuredSection.ctaLabel}
                className="btn btn-secondary"
              />
            </div>

            {featuredProducts.length > 0 ? (
              <div className="product-grid featured-product-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="featured" />
                ))}
              </div>
            ) : (
              <div className="surface empty-state-card">
                <strong>هنوز محصول شاخصی برای نمایش انتخاب نشده است</strong>
                <p className="muted">
                  به‌زودی پیشنهادهای شاخص فروشگاه در این بخش نمایش داده می‌شوند.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {homePageContent.newsSection.isVisible ? (
        <NewsSection articles={newsArticles.slice(0, 3)} content={homePageContent.newsSection} />
      ) : null}

      {homePageContent.trustSection.isVisible || homePageContent.roadmapSection.isVisible ? (
        <section className="section section-muted deferred-section">
          <div className="container roadmap-grid">
            {homePageContent.trustSection.isVisible ? (
              <div className="surface roadmap-card">
                <div className="eyebrow">{homePageContent.trustSection.eyebrow}</div>
                <h2 className="section-title">{homePageContent.trustSection.title}</h2>
                <ul className="feature-list-simple">
                  {homePageContent.trustSection.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {homePageContent.roadmapSection.isVisible ? (
              <div className="surface roadmap-card accent-grid">
                <div className="eyebrow">{homePageContent.roadmapSection.eyebrow}</div>
                <h2 className="section-title">{homePageContent.roadmapSection.title}</h2>
                <div className="roadmap-points">
                  {homePageContent.roadmapSection.phases.map((phase) => (
                    <div key={phase.title}>
                      <strong>{phase.title}</strong>
                      <p>{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {homePageContent.announcement.isVisible ? (
        <section className="section section-last deferred-section">
          <div className="container section-stack">
            <div className="surface support-strip">
              <div>
                <small>{homePageContent.announcement.label}</small>
                <strong>{homePageContent.announcement.title}</strong>
              </div>
              <p>{homePageContent.announcement.description}</p>
              <PageAction
                href={homePageContent.announcement.ctaHref}
                label={homePageContent.announcement.ctaLabel}
                className="btn btn-primary"
              />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
