import Link from "next/link";
import type { Metadata } from "next";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getSession } from "@/lib/auth";
import { getActiveCart } from "@/lib/cart";
import { getCheckoutErrorMessage } from "@/lib/checkout";
import { getPaymentProviderPresentation } from "@/lib/payment";
import { formatPriceIRR } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "تکمیل سفارش",
  robots: {
    index: false,
    follow: false
  }
};

type SearchParamsLike =
  | Promise<{
      error?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    error: Array.isArray(params.error) ? params.error[0] : params.error
  };
}

function getDefaultEmail(session: Awaited<ReturnType<typeof getSession>>) {
  if (session?.email) {
    return session.email;
  }

  return session?.identifier.includes("@") ? session.identifier : "";
}

function getDefaultPhone(session: Awaited<ReturnType<typeof getSession>>) {
  if (session?.phone) {
    return session.phone;
  }

  return session?.identifier && !session.identifier.includes("@") ? session.identifier : "";
}

export default async function CheckoutPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const params = await resolveSearchParams(searchParams);
  const [cart, session] = await Promise.all([getActiveCart(), getSession()]);
  const paymentProvider = getPaymentProviderPresentation();
  const errorMessage = getCheckoutErrorMessage(params.error);

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <div className="container section-stack">
          <div className="surface empty-state-card">
            <strong>برای ثبت سفارش هنوز آیتمی در سبد نیست</strong>
            <p className="muted">
              ابتدا محصول موردنظر را به سبد اضافه کن. بعد از آن از همین مسیر می‌توانی سفارش واقعی بسازی،
              شماره سفارش بگیری و وضعیت آن را بعدا پیگیری کنی.
            </p>
            <div className="btn-row">
              <Link href="/products" className="btn btn-primary">
                رفتن به فروشگاه
              </Link>
              <Link href="/cart" className="btn btn-ghost">
                بازگشت به سبد خرید
              </Link>
              <Link href="/help" className="btn btn-secondary">
                راهنما و پشتیبانی
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container section-stack">
        <AnalyticsPageView
          name="begin_checkout"
          route="/checkout"
          path="/checkout"
          entityType="cart"
          entityId={cart.cartId || undefined}
          metadata={{
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            cartSource: cart.source,
            paymentProvider: paymentProvider.key
          }}
        />
        {errorMessage ? (
          <div className="surface status-banner status-banner-warning" role="alert" aria-live="polite">
            <strong>ثبت سفارش کامل نشد</strong>
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <div className="checkout-layout">
          <div className="surface checkout-form-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">ثبت سفارش</div>
                <h1 className="page-title">ثبت اطلاعات سفارش</h1>
                <p className="muted section-text">
                  این فرم از سبد واقعی شما سفارش می‌سازد. ممکن است پرداخت زنده هنوز فعال نباشد، اما ثبت
                  سفارش، ذخیره اطلاعات مشتری و نگهداری وضعیت سفارش کاملا واقعی است.
                </p>
              </div>
            </div>

            <form className="checkout-form" action="/api/checkout" method="post">
              <div className="checkout-form-grid">
                <div className="field-group">
                  <label htmlFor="checkout-full-name">نام و نام خانوادگی</label>
                  <input
                    id="checkout-full-name"
                    name="fullName"
                    defaultValue={session?.displayName || ""}
                    autoComplete="name"
                    minLength={3}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="checkout-phone">شماره تماس</label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    dir="ltr"
                    defaultValue={getDefaultPhone(session)}
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="checkout-email">ایمیل</label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    dir="ltr"
                    defaultValue={getDefaultEmail(session)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    inputMode="email"
                    maxLength={160}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="checkout-notes">توضیح سفارش</label>
                  <textarea
                    id="checkout-notes"
                    name="notes"
                    rows={4}
                    maxLength={1000}
                    placeholder="اگر نکته‌ای برای هماهنگی این سفارش داری، اینجا بنویس."
                  />
                </div>
              </div>

              <div className="surface nested-card">
                <strong>اطلاعات ارسال در صورت نیاز</strong>
                <p className="muted small-note">
                  برای اغلب محصولات دیجیتال این بخش لازم نیست. فقط اگر برای تحویل، فاکتور یا هماهنگی پستی
                  به آدرس نیاز داری آن را پر کن.
                </p>

                <div className="checkout-form-grid">
                  <div className="field-group">
                    <label htmlFor="shipping-recipient-name">نام گیرنده</label>
                    <input id="shipping-recipient-name" name="shippingRecipientName" autoComplete="shipping name" maxLength={120} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="shipping-phone">شماره تماس گیرنده</label>
                    <input id="shipping-phone" name="shippingPhone" type="tel" dir="ltr" autoComplete="shipping tel" inputMode="tel" maxLength={20} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="shipping-province">استان</label>
                    <input id="shipping-province" name="shippingProvince" autoComplete="shipping address-level1" maxLength={80} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="shipping-city">شهر</label>
                    <input id="shipping-city" name="shippingCity" autoComplete="shipping address-level2" maxLength={80} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="shipping-address-line-1">نشانی</label>
                    <textarea
                      id="shipping-address-line-1"
                      name="shippingAddressLine1"
                      rows={3}
                      maxLength={300}
                      autoComplete="shipping street-address"
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="shipping-address-line-2">نشانی تکمیلی</label>
                    <input id="shipping-address-line-2" name="shippingAddressLine2" maxLength={300} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="shipping-postal-code">کد پستی</label>
                    <input id="shipping-postal-code" name="shippingPostalCode" type="text" dir="ltr" inputMode="numeric" maxLength={20} />
                  </div>
                </div>
              </div>

              <div className="checkout-actions">
                <button className="btn btn-primary" type="submit">
                  ثبت سفارش
                </button>
                <Link className="btn btn-secondary" href="/purchase-terms">
                  شرایط خرید
                </Link>
                <Link className="btn btn-ghost" href="/cart">
                  بازگشت به سبد
                </Link>
              </div>
            </form>
          </div>

          <aside className="surface order-summary-card">
            <div className="eyebrow">خلاصه سفارش</div>

            <div className="order-item-list">
              {cart.items.map((item) => (
                <div className="order-item-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span className="muted">{item.quantity.toLocaleString("fa-IR")} عدد</span>
                  </div>
                  <strong>{formatPriceIRR(item.totalPrice)} تومان</strong>
                </div>
              ))}
            </div>

            <div className="checkout-lines">
              <div>
                <span>تعداد اقلام</span>
                <strong>{cart.itemCount.toLocaleString("fa-IR")}</strong>
              </div>
              <div>
                <span>زیرجمع</span>
                <strong>{formatPriceIRR(cart.subtotal)} تومان</strong>
              </div>
            </div>

            <div className="status-banner status-banner-warning">
              <strong>{paymentProvider.title}</strong>
              <p>{paymentProvider.description}</p>
            </div>

            <div className="surface nested-card">
              <strong>وضعیت فعلی پرداخت</strong>
              <p className="muted">
                روش فعلی پرداخت: {paymentProvider.label}. بعد از ثبت سفارش، یک شماره سفارش واقعی می‌گیری و
                مسیر بعدی پرداخت یا پیگیری به‌صورت شفاف به شما نشان داده می‌شود.
              </p>
            </div>

            <div className="surface nested-card">
              <strong>پیش از ثبت سفارش</strong>
              <ul className="feature-list-simple compact">
                <li>اطلاعات تماس را طوری ثبت کن که برای هماهنگی سفارش واقعا در دسترس باشد.</li>
                <li>اگر سفارش نیاز به نشانی ندارد، لازم نیست همه فیلدهای ارسال را پر کنی.</li>
                <li>برای سیاست بازگشت وجه و تحویل، از لینک‌های پایین همین بخش استفاده کن.</li>
              </ul>
              <div className="chip-row">
                <Link href="/refund-policy" className="chip chip-link">
                  سیاست بازگشت وجه
                </Link>
                <Link href="/delivery" className="chip chip-link">
                  تحویل و پیگیری
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
