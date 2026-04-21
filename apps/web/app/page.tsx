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
  getStoreNews
} from "@/lib/content";

export default async function HomePage() {
  const [featuredProducts, newsArticles, categoryCounts, heroStats, homePageContent] = await Promise.all([
    getFeaturedStoreProducts(),
    getStoreNews(),
    getStoreCategoryCounts(),
    getHeroStats(),
    getHomePageContent()
  ]);

  return (
    <>
      <NewsSection articles={newsArticles.slice(0, 3)} content={homePageContent.newsSection} />
      <Hero featured={featuredProducts.slice(0, 4)} stats={heroStats} content={homePageContent.hero} />

      <section className="section">
        <div className="container section-stack">
          <div className="section-header">
            <div>
              <div className="eyebrow">ورود سریع به دسته‌ها</div>
              <h2 className="section-title">چینش فروشگاهی حرفه‌ای برای شروع لانچ</h2>
              <p className="muted section-text">
                به‌جای یک صفحه ساده، فروشگاه جدید با دسته‌های واضح، شلف محصولات و حس
                برندینگ حرفه‌ای شروع می‌کند.
              </p>
            </div>
            <Link href="/products" className="btn btn-ghost">
              دیدن کاتالوگ کامل
            </Link>
          </div>

          <CategoryGrid items={categoryCounts} />
        </div>
      </section>

      <section className="section">
        <div className="container section-stack">
          <div className="section-header">
            <div>
              <div className="eyebrow">محصولات فاز اول</div>
              <h2 className="section-title">محصولات واقعی که از سایت فعلی برداشته شدند</h2>
            </div>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="surface empty-state-card">
              <strong>هنوز محصول شاخصی برای نمایش انتخاب نشده است</strong>
              <p className="muted">
                از CMS می‌توانی روی محصولات موردنظر گزینه `featured` را فعال کنی تا در صفحه
                اصلی نمایش داده شوند.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container roadmap-grid">
          <div className="surface roadmap-card">
            <div className="eyebrow">چرا این طراحی بهتر شد</div>
            <h2 className="section-title">فروشگاه حالا حس برند و اعتماد دارد</h2>
            <ul className="feature-list-simple">
              <li>هدر حرفه‌ای با CTA و اطلاعات تماس</li>
              <li>هیرو قوی با پیشنهاد ارزشی روشن</li>
              <li>شلف‌های محصول با قیمت قبل و بعد از تخفیف</li>
              <li>کارت‌های دسته‌بندی و مسیر خرید سریع</li>
              <li>زبان طراحی یکپارچه برای توسعه فازهای بعد</li>
            </ul>
          </div>

          <div className="surface roadmap-card accent-grid">
            <div className="eyebrow">فازهای بعدی روی همین پایه</div>
            <div className="roadmap-points">
              <div>
                <strong>آکادمی</strong>
                <p>دوره، بوت‌کمپ، اشتراک آموزشی و محتوای ویژه.</p>
              </div>
              <div>
                <strong>بازارچه ایجنت</strong>
                <p>لیست ایجنت‌ها، فروشنده‌ها، کمیسیون و لیست ویژه.</p>
              </div>
              <div>
                <strong>فروش واقعی</strong>
                <p>اتصال به هسته سفارش، کوپن، پرداخت و OTP در فاز بعد.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-last">
        <div className="container section-stack">
          <div className="surface support-strip">
            <div>
              <small>{homePageContent.announcement.label}</small>
              <strong>{homePageContent.announcement.title}</strong>
            </div>
            <p>{homePageContent.announcement.description}</p>
            <Link href={homePageContent.announcement.ctaHref} className="btn btn-primary">
              {homePageContent.announcement.ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
