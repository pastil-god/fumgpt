import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="surface footer-brand-card">
          <div className="brand">
            <img src="/logo.svg" alt="FumGPT" width="44" height="44" />
            <div>
              <strong>{siteConfig.name}</strong>
              <span>ویترین حرفه‌ای محصولات دیجیتال</span>
            </div>
          </div>
          <p className="muted">
            {siteConfig.name} برای عرضه عمومی امروز با تمرکز روی کاتالوگ واقعی، تجربه مرور روان و مدیریت ساده محتوا آماده شده است و از همین حالا
            مسیر توسعه آکادمی و بازارچه ایجنت را هم باز نگه می‌دارد.
          </p>
          <div className="chip-row">
            {siteConfig.trustPills.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="surface footer-card">
          <h3>لینک‌های مهم</h3>
          <div className="footer-links">
            <Link href="/products">فروشگاه</Link>
            <Link href="/news">خبرها و مقاله‌ها</Link>
            <Link href="/academy">آکادمی</Link>
            <Link href="/agents">بازارچه ایجنت</Link>
            <Link href="/account">حساب کاربری</Link>
          </div>
        </div>

        <div className="surface footer-card">
          <h3>تماس و پشتیبانی</h3>
          <div className="footer-links">
            <a href={siteConfig.telegram} target="_blank" rel="noreferrer">
              تلگرام
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
              اینستاگرام
            </a>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <span>{siteConfig.phone}</span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 {siteConfig.name}. همه حقوق محفوظ است.</span>
        <span>نسخه امروز: ویترین عمومی، کاتالوگ واقعی و مدیریت محتوای بیرونی</span>
      </div>
    </footer>
  );
}
