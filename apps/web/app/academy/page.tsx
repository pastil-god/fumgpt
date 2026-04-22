import Link from "next/link";

export default function AcademyPage() {
  return (
    <section className="section">
      <div className="container future-grid">
        <div className="surface future-main">
          <div className="eyebrow">زیرساخت آموزشی</div>
          <h1 className="page-title">آکادمی FumGPT</h1>
          <p className="muted section-text">
            آکادمی روی همین هسته طراحی و محتوای فعلی راه‌اندازی می‌شود تا دوره‌ها، بوت‌کمپ‌ها و اشتراک‌های آموزشی بدون بازطراحی کلی سایت به نسخه
            بعدی اضافه شوند. برای لانچ امروز، این صفحه نقش معرفی مسیر آموزشی و جمع‌کردن اعتماد اولیه را دارد.
          </p>
          <div className="chip-row is-large-gap">
            <span className="chip">مسیر آموزشی مرحله‌ای</span>
            <span className="chip">آماده اتصال به CMS</span>
            <span className="chip">قابل توسعه بدون بازطراحی</span>
          </div>
          <div className="btn-row">
            <Link href="/news" className="btn btn-primary">
              پیگیری خبرهای آکادمی
            </Link>
            <Link href="/products" className="btn btn-ghost">
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>

        <div className="future-cards" id="learning-path">
          <div className="surface nested-card">
            <strong>دوره‌های کاربردی</strong>
            <p className="muted">فروش دوره، محتوای دانلودی و دسترسی آموزشی در همان زبان طراحی فروشگاه.</p>
          </div>
          <div className="surface nested-card">
            <strong>بوت‌کمپ‌های پروژه‌محور</strong>
            <p className="muted">برای تجربه آموزشی حرفه‌ای، تمرین عملی و همراهی مرحله‌به‌مرحله.</p>
          </div>
          <div className="surface nested-card">
            <strong>عضویت حرفه‌ای</strong>
            <p className="muted">اشتراک آموزشی، جلسات تکمیلی و محتوای ویژه برای کاربران وفادار.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
