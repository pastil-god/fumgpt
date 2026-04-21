import Link from "next/link";
import { Hero } from "@/components/hero";
import { NewsSection } from "@/components/news-section";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import {
  getFeaturedStoreProducts,
  getHeroStats,
  getStoreCategoryCounts,
  getStoreNews
} from "@/lib/content";

export default async function HomePage() {
  const [featuredProducts, newsArticles, categoryCounts, heroStats] = await Promise.all([
    getFeaturedStoreProducts(),
    getStoreNews(),
    getStoreCategoryCounts(),
    getHeroStats()
  ]);

  return (
    <>
      <NewsSection articles={newsArticles.slice(0, 3)} />
      <Hero featured={featuredProducts.slice(0, 4)} stats={heroStats} />

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

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
              <small>Launch Mode</small>
              <strong>الان تمرکز روی لانچ پوسته و کاتالوگ واقعی است</strong>
            </div>
            <p>
              در این مرحله به‌جای درگیر شدن با درگاه و پیامک، ظاهر، ساختار و محصولات را
              روی دامنه جدید حرفه‌ای می‌کنیم تا فاز بعدی روی یک پایه تمیز سوار شود.
            </p>
            <Link href="/login" className="btn btn-primary">
              ورود آزمایشی
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
