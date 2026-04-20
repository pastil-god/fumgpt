import Link from "next/link";
import { getFeaturedProducts } from "@/lib/mock-data";

export function Hero() {
  const featured = getFeaturedProducts(3);

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy surface hero-copy-card">
          <div className="eyebrow">فروشگاه جدید برند FumGPT</div>
          <h1>
            فروش حرفه‌ای اکانت‌های هوش مصنوعی با ظاهر <span>سطح بالا</span>
          </h1>
          <p>
            پوسته جدید از حالت ساده خارج شد و به یک فروشگاه جدی با حس برندینگ، شلف‌های
            محصول، CTA واضح، بنر تخفیف و مسیر توسعه آینده تبدیل شده است.
          </p>

          <div className="hero-search">
            <div>
              <strong>دنبال چه سرویسی هستی؟</strong>
              <span>ChatGPT، Gemini، Cursor، Canva، CapCut و بیشتر</span>
            </div>
            <Link className="btn btn-primary" href="/products">
              ورود به فروشگاه
            </Link>
          </div>

          <div className="chip-row is-large-gap">
            <span className="chip chip-highlight">محصولات واقعی سایت فعلی وارد شد</span>
            <span className="chip">UI بازطراحی‌شده برای فاز اول</span>
            <span className="chip">آماده اتصال درگاه و پیامک</span>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <strong>7</strong>
              <span>محصول واقعی واردشده</span>
            </div>
            <div className="stat-card">
              <strong>4</strong>
              <span>دسته اصلی برای شروع</span>
            </div>
            <div className="stat-card">
              <strong>2</strong>
              <span>ماژول رزروشده برای فاز بعد</span>
            </div>
          </div>
        </div>

        <div className="surface hero-preview-card">
          <div className="hero-preview-header">
            <div>
              <span className="preview-pill">شلف منتخب امروز</span>
              <h2>پرفروش‌های شروع لانچ</h2>
            </div>
            <Link href="/products">مشاهده همه</Link>
          </div>

          <div className="mini-product-stack">
            {featured.map((item) => (
              <Link href={`/products/${item.slug}`} key={item.id} className="mini-product">
                <div className={`mini-mark accent-${item.accent}`}>{item.coverLabel}</div>
                <div className="mini-copy">
                  <strong>{item.title}</strong>
                  <span>{item.shortDescription}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="launch-banner accent-grid">
            <div>
              <small>Roadmap Ready</small>
              <strong>آکادمی + مارکت‌پلیس AI Agent</strong>
            </div>
            <p>
              UI جدید طوری چیده شده که بعداً بتوانی آموزش، اشتراک، فروشنده و لیست ایجنت
              را روی همین پایه بالا بیاوری.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
