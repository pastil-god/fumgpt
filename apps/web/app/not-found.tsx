import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="surface not-found-card">
          <div className="eyebrow">404</div>
          <h1 className="page-title">صفحه مورد نظر پیدا نشد</h1>
          <p className="muted section-text">
            احتمالاً لینک تغییر کرده یا هنوز در فاز بعدی ساخته می‌شود.
          </p>
          <Link href="/" className="btn btn-primary">
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </section>
  );
}
