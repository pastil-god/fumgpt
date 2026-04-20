export default function AgentsPage() {
  return (
    <section className="section">
      <div className="container future-grid">
        <div className="surface future-main">
          <div className="eyebrow">رزرو شده برای فاز توسعه</div>
          <h1 className="page-title">بازارچه AI Agent</h1>
          <p className="muted section-text">
            این بخش از الان در ناوبری و طراحی سایت حضور دارد تا در فازهای بعد بتوانی
            ایجنت‌ها، فروشنده‌ها، لیست ویژه، کمیسیون و پلن‌های مارکت‌پلیسی را روی همین
            زیرساخت اجرا کنی.
          </p>
        </div>

        <div className="future-cards">
          <div className="surface nested-card">
            <strong>لیست ایجنت‌ها</strong>
            <p className="muted">نمایش قابلیت، قیمت، دمو و امتیاز کاربران.</p>
          </div>
          <div className="surface nested-card">
            <strong>پنل فروشنده</strong>
            <p className="muted">ثبت سرویس، تأیید ادمین و مدیریت درآمد.</p>
          </div>
          <div className="surface nested-card">
            <strong>درآمد بازارچه</strong>
            <p className="muted">کمیسیون، تبلیغ، لیست ویژه و اشتراک فروشنده.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
