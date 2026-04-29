import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="surface not-found-card">
          <div className="eyebrow">404</div>
          <h1 className="page-title">صفحه مورد نظر پیدا نشد</h1>
          <p className="muted section-text">
            احتمالاً لینک تغییر کرده، محتوا هنوز منتشر نشده یا این آدرس از CMS حذف شده است.
          </p>
          <div className="btn-row">
            <Link href="/" className="btn btn-primary">
              بازگشت به خانه
            </Link>
            <Link href="/products" className="btn btn-ghost">
              مشاهده محصولات
            </Link>
            <Link href="/news" className="btn btn-ghost">
              صفحه خبرها
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
