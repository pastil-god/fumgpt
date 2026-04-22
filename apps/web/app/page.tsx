import Link from "next/link";
import { Hero } from "@/components/hero";
import { NewsSection } from "@/components/news-section";
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
import { isExternalHref } from "@/lib/site";

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
                  اگر از CMS استفاده می‌کنی، گزینه `featured` را روی محصولات موردنظر فعال کن تا در این بخش نمایش داده شوند.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {homePageContent.newsSection.isVisible ? (
        <NewsSection articles={newsArticles.slice(0, 3)} content={homePageContent.newsSection} />
      ) : null}

      <section className="section section-muted deferred-section">
        <div className="container roadmap-grid">
          <div className="surface roadmap-card">
            <div className="eyebrow">چرا FumGPT</div>
            <h2 className="section-title">یک ویترین روشن، مرتب و قابل اعتماد برای خرید دیجیتال</h2>
            <ul className="feature-list-simple">
              <li>هدر تمیز و سبک با ناوبری خوانا و اکشن‌های واضح</li>
              <li>بنر اصلی روشن با CTAهای مستقیم و اعتمادساز</li>
              <li>تب‌های دسته‌بندی و کارت‌های گرد برای مرور راحت‌تر</li>
              <li>کارت محصول با قیمت‌گذاری شفاف و مسیر خرید مشخص</li>
              <li>سازگاری کامل با CMS و توسعه فازهای بعدی روی همین ظاهر</li>
            </ul>
          </div>

          <div className="surface roadmap-card accent-grid">
            <div className="eyebrow">مسیر توسعه</div>
            <div className="roadmap-points">
              <div>
                <strong>فروشگاه</strong>
                <p>کاتالوگ زنده، خبرهای قابل مدیریت و تجربه مرور حرفه‌ای برای عرضه عمومی.</p>
              </div>
              <div>
                <strong>آکادمی</strong>
                <p>دوره‌ها، بوت‌کمپ‌ها و محتوای آموزشی می‌توانند روی همین زبان طراحی اضافه شوند.</p>
              </div>
              <div>
                <strong>بازارچه ایجنت</strong>
                <p>در فاز بعد، سرویس‌ها و فروشندگان جدید بدون تغییر در معماری اصلی به همین ویترین متصل می‌شوند.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
