import Link from "next/link";
import type { Metadata } from "next";
import { academyOperationalNotes } from "@/lib/operations-content";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "آکادمی",
  description:
    "معرفی روشن مسیر آموزشی آینده FumGPT، بدون وعده فروش زودهنگام و با توضیح صادقانه درباره وضعیت فعلی آکادمی.",
  path: "/academy"
});

export default function AcademyPage() {
  return (
    <section className="section">
      <div className="container future-grid">
        <div className="surface future-main">
          <div className="eyebrow">مسیر آموزشی آینده</div>
          <h1 className="page-title">آکادمی FumGPT</h1>
          <p className="muted section-text">
            این بخش برای معرفی مسیر آموزشی آینده است، نه فروش دوره زنده. اگر به آموزش‌های آینده علاقه‌مند هستی، از همین صفحه می‌توانی موضوعات، مرزهای فعلی و مسیر پیگیری خبرهای بعدی را ببینی.
          </p>
          <div className="status-banner status-banner-warning">
            <strong>دوره و عضویت آموزشی هنوز فعال نشده است</strong>
            <p>در این فاز، آکادمی فقط مسیر و انتظارات را توضیح می‌دهد و هنوز هیچ دوره یا اشتراک آموزشی عمومی برای خرید منتشر نشده است.</p>
          </div>
          <div className="chip-row is-large-gap">
            <span className="chip">شفاف درباره وضعیت فعلی</span>
            <span className="chip">قابل انتقال به CMS در مرحله بعد</span>
            <span className="chip">بدون وعده فروش آموزشی زودهنگام</span>
          </div>
          <div className="btn-row">
            <Link href="/news" className="btn btn-primary">
              پیگیری خبرها و به‌روزرسانی‌ها
            </Link>
            <Link href="/faq" className="btn btn-secondary">
              پرسش‌های متداول عملیاتی
            </Link>
            <Link href="/products" className="btn btn-ghost">
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>

        <div className="future-cards" id="learning-path">
          <div className="surface nested-card">
            <strong>در این مرحله چه چیزی روشن است</strong>
            <ul className="feature-list-simple compact">
              {academyOperationalNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="surface nested-card">
            <strong>دوره‌های کاربردی</strong>
            <p className="muted">اگر بعداً دوره یا محتوای آموزشی اضافه شود، روی همین زبان طراحی و با توضیح روشن درباره وضعیت خرید، دسترسی و تحویل منتشر خواهد شد.</p>
          </div>
          <div className="surface nested-card">
            <strong>بوت‌کمپ‌های پروژه‌محور</strong>
            <p className="muted">تمرین عملی و همراهی مرحله‌به‌مرحله در برنامه آینده دیده شده، اما هنوز به‌عنوان محصول قابل سفارش عمومی باز نشده است.</p>
          </div>
          <div className="surface nested-card">
            <strong>عضویت حرفه‌ای</strong>
            <p className="muted">اشتراک آموزشی و محتوای ویژه زمانی فعال می‌شوند که مسیر فروش، پشتیبانی و تحویل آن‌ها واقعاً آماده و روشن باشد.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
