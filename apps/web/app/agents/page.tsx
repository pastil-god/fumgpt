import Link from "next/link";

export default function AgentsPage() {
  return (
    <section className="section">
      <div className="container future-grid">
        <div className="surface future-main">
          <div className="eyebrow">زیرساخت بازارچه</div>
          <h1 className="page-title">بازارچه ایجنت FumGPT</h1>
          <p className="muted section-text">
            این بخش از همین امروز در ناوبری و طراحی سایت حضور دارد تا در مرحله بعد بتوانی ایجنت‌ها، فروشنده‌ها، پلن‌های ارائه و ساختار بازارچه را
            روی همین زیرساخت اجرا کنی. در نسخه فعلی، این صفحه مسیر توسعه آینده را به‌صورت شفاف و حرفه‌ای معرفی می‌کند.
          </p>
          <div className="chip-row is-large-gap">
            <span className="chip">ورود مرحله‌ای فروشندگان</span>
            <span className="chip">آماده توسعه بازارچه</span>
            <span className="chip">هم‌راستا با ویترین فعلی</span>
          </div>
          <div className="btn-row">
            <Link href="/products" className="btn btn-primary">
              مشاهده فروشگاه
            </Link>
            <Link href="/news" className="btn btn-ghost">
              خبرهای توسعه را بخوان
            </Link>
          </div>
        </div>

        <div className="future-cards">
          <div className="surface nested-card">
            <strong>فهرست ایجنت‌ها</strong>
            <p className="muted">نمایش قابلیت‌ها، پلن ارائه، دموی محصول و بازخورد کاربران در یک ویترین منسجم.</p>
          </div>
          <div className="surface nested-card">
            <strong>پروفایل فروشنده</strong>
            <p className="muted">ثبت سرویس، تأیید محتوا و مدیریت عرضه در یک مسیر ساده و قابل توسعه.</p>
          </div>
          <div className="surface nested-card">
            <strong>مدل ارائه و کمیسیون</strong>
            <p className="muted">کمیسیون، جایگاه ویژه و پلن‌های همکاری بدون نیاز به بازطراحی ساختار فعلی.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
