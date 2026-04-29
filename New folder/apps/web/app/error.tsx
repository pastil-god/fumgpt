"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="section">
      <div className="container">
        <div className="surface empty-state-card">
          <strong>مشکلی در بارگذاری این بخش پیش آمد</strong>
          <p className="muted">
            خطا ثبت شد و می‌توانی دوباره تلاش کنی. اگر مشکل ادامه داشت، از صفحه اصلی ادامه بده.
          </p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => reset()} type="button">
              تلاش دوباره
            </button>
            <a className="btn btn-ghost" href="/">
              بازگشت به خانه
            </a>
          </div>
          <small className="muted">{error.message}</small>
        </div>
      </div>
    </section>
  );
}
