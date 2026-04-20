export default function AcademyPage() {
  return (
    <section className="section">
      <div className="container future-grid">
        <div className="surface future-main">
          <div className="eyebrow">رزرو شده برای فاز دوم</div>
          <h1 className="page-title">آکادمی FumGPT</h1>
          <p className="muted section-text">
            این صفحه از همین حالا در معماری و طراحی رزرو شده تا دوره‌ها، بوت‌کمپ‌ها،
            اشتراک آموزشی و دسترسی اعضا بعداً بدون تغییر ظاهر اصلی سایت اضافه شوند.
          </p>
        </div>

        <div className="future-cards">
          <div className="surface nested-card">
            <strong>دوره‌های مستقل</strong>
            <p className="muted">فروش دوره، محتوای دانلودی و دسترسی بعد از خرید.</p>
          </div>
          <div className="surface nested-card">
            <strong>بوت‌کمپ و cohort</strong>
            <p className="muted">برای تجربه آموزشی حرفه‌ای و پروژه‌محور.</p>
          </div>
          <div className="surface nested-card">
            <strong>عضویت ویژه</strong>
            <p className="muted">اشتراک آموزشی، جلسات خصوصی و محتوای پریمیوم.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
