import Link from "next/link";
import type { Metadata } from "next";
import { getFeaturedStoreProducts, getStorefrontSettings } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";
import { isExternalHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "سبد خرید"
};

export default async function CartPage() {
  const [items, storefrontSettings] = await Promise.all([
    getFeaturedStoreProducts(3),
    getStorefrontSettings()
  ]);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="section">
      <div className="container cart-grid">
        <div className="surface cart-list-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">مرور سفارش</div>
              <h1 className="page-title">خلاصه انتخاب‌های شما</h1>
              <p className="muted section-text">
                در نسخه امروز این بخش برای مرور انتخاب‌ها و هماهنگی خرید آماده است. پرداخت آنلاین در مرحله بعدی فعال می‌شود.
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className={`cart-mark accent-${item.accent}`}>{item.coverLabel}</div>
                  <div className="cart-copy">
                    <strong>{item.title}</strong>
                    <span>{item.delivery}</span>
                  </div>
                  <div className="cart-price">{formatPriceIRR(item.price)} تومان</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="surface empty-state-card">
              <strong>سبد خرید فعلاً خالی است</strong>
              <p className="muted">هنوز محصولی برای بررسی انتخاب نشده است. از فروشگاه شروع کن و بعد دوباره به این بخش برگرد.</p>
            </div>
          )}
        </div>

        <aside className="surface checkout-card">
          <div className="eyebrow">مرحله بعدی</div>
          <div className="status-banner status-banner-warning">
            <strong>ثبت نهایی سفارش با هماهنگی انجام می‌شود</strong>
            <p>برای لانچ اولیه، این بخش خلاصه سفارش را نمایش می‌دهد و هماهنگی خرید از طریق پشتیبانی انجام می‌شود.</p>
          </div>

          <div className="checkout-lines">
            <div>
              <span>جمع انتخاب‌ها</span>
              <strong>{formatPriceIRR(subtotal)} تومان</strong>
            </div>
            <div>
              <span>وضعیت پرداخت</span>
              <strong>غیرفعال در این مرحله</strong>
            </div>
            <div>
              <span>نحوه پیگیری</span>
              <strong>هماهنگی با پشتیبانی</strong>
            </div>
          </div>

          {isExternalHref(storefrontSettings.support.helpCtaHref) ? (
            <a
              className="btn btn-primary btn-block"
              href={storefrontSettings.support.helpCtaHref}
              target="_blank"
              rel="noreferrer"
            >
              {storefrontSettings.support.helpCtaLabel}
            </a>
          ) : (
            <Link className="btn btn-primary btn-block" href={storefrontSettings.support.helpCtaHref}>
              {storefrontSettings.support.helpCtaLabel}
            </Link>
          )}
          <Link className="btn btn-ghost btn-block" href="/products">
            ادامه مرور فروشگاه
          </Link>
        </aside>
      </div>
    </section>
  );
}
