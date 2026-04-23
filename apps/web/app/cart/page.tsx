import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getActiveCart } from "@/lib/cart";
import { getFeaturedStoreProducts, getStorefrontSettings } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";
import { getPaymentProviderPresentation } from "@/lib/payment";
import { isExternalHref } from "@/lib/site";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  },
  title: "سبد خرید"
};

type SearchParamsLike =
  | Promise<{
      cart?: string | string[];
      cartError?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    cart: Array.isArray(params.cart) ? params.cart[0] : params.cart,
    cartError: Array.isArray(params.cartError) ? params.cartError[0] : params.cartError
  };
}

function getCartStatusMessage(status?: string, error?: string) {
  if (error === "product-not-found") {
    return {
      tone: "status-banner-warning",
      title: "محصول انتخاب‌شده پیدا نشد",
      description: "ممکن است این محصول از ویترین حذف شده باشد یا لینک آن تغییر کرده باشد."
    };
  }

  if (error === "cart-item-not-found") {
    return {
      tone: "status-banner-warning",
      title: "این آیتم دیگر در سبد شما نبود",
      description: "سبد به‌روزرسانی شد. اگر لازم است دوباره از فروشگاه محصول را اضافه کن."
    };
  }

  if (error === "merge-failed") {
    return {
      tone: "status-banner-warning",
      title: "ورود انجام شد اما انتقال سبد کامل نشد",
      description: "برای جلوگیری از از دست رفتن اطلاعات، سبد مهمان حذف نشد. بهتر است یک بار صفحه را تازه کنی و سبد را بررسی کنی."
    };
  }

  switch (status) {
    case "added":
      return {
        tone: "status-banner-success",
        title: "محصول به سبد خرید اضافه شد",
        description: "اکنون می‌توانی تعداد را تغییر بدهی یا محصولات دیگری هم به سبد اضافه کنی."
      };
    case "updated":
      return {
        tone: "status-banner-success",
        title: "تعداد آیتم به‌روزرسانی شد",
        description: "جمع مبلغ سبد بر اساس داده واقعی همین لحظه دوباره محاسبه شد."
      };
    case "removed":
      return {
        tone: "status-banner-success",
        title: "آیتم از سبد حذف شد",
        description: "در صورت نیاز می‌توانی دوباره از صفحه محصول آن را به سبد اضافه کنی."
      };
    case "merged":
      return {
        tone: "status-banner-success",
        title: "سبد مهمان به حساب شما منتقل شد",
        description: "از این به بعد همین سبد روی حساب کاربری شما نگه‌داری می‌شود."
      };
    default:
      return null;
  }
}

function getCartSourceLabel(source: "guest" | "user" | "empty", itemCount: number) {
  if (source === "user" && itemCount > 0) {
    return "متصل به حساب کاربری";
  }

  if (source === "guest" && itemCount > 0) {
    return "سبد مهمان روی این دستگاه";
  }

  return "خالی";
}

export default async function CartPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const params = await resolveSearchParams(searchParams);
  const [cart, featuredProducts, storefrontSettings] = await Promise.all([
    getActiveCart(),
    getFeaturedStoreProducts(4),
    getStorefrontSettings()
  ]);
  const paymentProvider = getPaymentProviderPresentation();

  const statusMessage = getCartStatusMessage(params.cart, params.cartError);
  const hasItems = cart.items.length > 0;
  const cartProductSlugs = new Set(cart.items.map((item) => item.productSlug));
  const recommendations = featuredProducts.filter((item) => !cartProductSlugs.has(item.slug)).slice(0, 3);

  return (
    <section className="section">
      <div className="container section-stack">
        {statusMessage ? (
          <div className={`surface status-banner ${statusMessage.tone}`}>
            <strong>{statusMessage.title}</strong>
            <p>{statusMessage.description}</p>
          </div>
        ) : null}

        <div className="cart-grid">
          <div className="surface cart-list-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">سبد خرید</div>
                <h1 className="page-title">مدیریت واقعی اقلام انتخاب‌شده</h1>
                <p className="muted section-text">
                  این صفحه از داده واقعی سبد استفاده می‌کند. می‌توانی اقلام را اضافه، حذف یا تعدادشان را
                  به‌روزرسانی کنی و زیرجمع هم فقط از همین داده‌ها محاسبه می‌شود. اگر پرداخت زنده هنوز فعال
                  نباشد، این موضوع در همین صفحه و مرحله ثبت سفارش شفاف گفته می‌شود.
                </p>
              </div>
            </div>

            {hasItems ? (
              <div className="cart-items">
                {cart.items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className={`cart-mark accent-${item.product?.accent || "cyan"}`}>
                      {item.product?.coverLabel || "CART"}
                    </div>

                    <div className="cart-copy">
                      <strong>{item.title}</strong>

                      <div className="cart-line-meta">
                        <span>{formatPriceIRR(item.unitPrice)} تومان برای هر واحد</span>
                        <span>{item.quantity.toLocaleString("fa-IR")} عدد</span>
                        {item.product?.delivery ? <span>{item.product.delivery}</span> : null}
                      </div>

                      {item.product ? (
                        <Link href={`/products/${item.productSlug}`} className="chip chip-link" prefetch={false}>
                          مشاهده محصول
                        </Link>
                      ) : (
                        <p className="cart-note">
                          این محصول فعلا در ویترین فعال نیست، اما آیتم ذخیره‌شده سبد شما حفظ شده است.
                        </p>
                      )}

                      <div className="cart-line-actions">
                        <form className="cart-quantity-form" action="/api/cart/update" method="post">
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="redirectTo" value="/cart" />
                          <div className="cart-quantity-field">
                            <label htmlFor={`quantity-${item.id}`}>تعداد</label>
                            <div className="cart-quantity-controls">
                              <input
                                id={`quantity-${item.id}`}
                                className="cart-quantity-input"
                                name="quantity"
                                type="number"
                                min="1"
                                max="99"
                                defaultValue={item.quantity}
                                inputMode="numeric"
                              />
                              <button className="btn btn-secondary" type="submit">
                                به‌روزرسانی
                              </button>
                            </div>
                          </div>
                        </form>

                        <form action="/api/cart/remove" method="post">
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="redirectTo" value="/cart" />
                          <button className="btn btn-ghost" type="submit">
                            حذف از سبد
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="cart-price">
                      <span>جمع این ردیف</span>
                      <strong>{formatPriceIRR(item.totalPrice)} تومان</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="surface empty-state-card">
                <strong>سبد خرید شما خالی است</strong>
                <p className="muted">
                  هنوز محصولی به سبد اضافه نشده است. از صفحه هر محصول می‌توانی آن را به سبد اضافه کنی و بعد
                  اینجا تعداد، مبلغ و مسیر ادامه سفارش را مدیریت کنی.
                </p>
                <div className="btn-row">
                  <Link href="/products" className="btn btn-secondary">
                    رفتن به فروشگاه
                  </Link>
                  <Link href="/help" className="btn btn-ghost">
                    راهنما و پشتیبانی
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="surface checkout-card">
            <div className="eyebrow">خلاصه سبد</div>

            <div className="checkout-lines">
              <div>
                <span>تعداد اقلام</span>
                <strong>{cart.itemCount.toLocaleString("fa-IR")}</strong>
              </div>
              <div>
                <span>زیرجمع</span>
                <strong>{formatPriceIRR(cart.subtotal)} تومان</strong>
              </div>
              <div>
                <span>وضعیت سبد</span>
                <strong>{getCartSourceLabel(cart.source, cart.itemCount)}</strong>
              </div>
            </div>

            <div className="status-banner status-banner-warning">
              <strong>{paymentProvider.title}</strong>
              <p>{paymentProvider.description}</p>
            </div>

            <div className="surface nested-card">
              <strong>قبل از ادامه چه چیزی را بدانی</strong>
              <ul className="feature-list-simple compact">
                <li>ثبت سفارش واقعی است و شماره سفارش واقعی تولید می‌شود.</li>
                <li>اگر پرداخت زنده فعال نباشد، checkout این موضوع را شفاف توضیح می‌دهد.</li>
                <li>برای جزئیات بیشتر می‌توانی شرایط خرید و راهنمای تحویل را ببینی.</li>
              </ul>
            </div>

            {cart.source === "guest" && hasItems ? (
              <Link className="btn btn-secondary btn-block" href="/login?next=/cart">
                ورود و انتقال سبد به حساب
              </Link>
            ) : null}

            {hasItems ? (
              <Link className="btn btn-primary btn-block" href="/checkout">
                ادامه و ثبت سفارش
              </Link>
            ) : (
              <button className="btn btn-primary btn-block" type="button" disabled>
                برای ادامه، ابتدا محصولی به سبد اضافه کن
              </button>
            )}

            {isExternalHref(storefrontSettings.support.helpCtaHref) ? (
              <a
                className="btn btn-ghost btn-block"
                href={storefrontSettings.support.helpCtaHref}
                target="_blank"
                rel="noreferrer"
              >
                {storefrontSettings.support.helpCtaLabel}
              </a>
            ) : (
              <Link className="btn btn-ghost btn-block" href={storefrontSettings.support.helpCtaHref}>
                {storefrontSettings.support.helpCtaLabel}
              </Link>
            )}

            <Link className="btn btn-ghost btn-block" href="/products">
              بازگشت به فروشگاه
            </Link>

            <div className="chip-row">
              <Link className="chip chip-link" href="/purchase-terms">
                شرایط خرید
              </Link>
              <Link className="chip chip-link" href="/delivery">
                تحویل و پیگیری
              </Link>
            </div>
          </aside>
        </div>

        {recommendations.length > 0 ? (
          <div className="section-stack">
            <div className="section-header">
              <div>
                <div className="eyebrow">{hasItems ? "برای ادامه خرید" : "برای شروع خرید"}</div>
                <h2 className="section-title">محصولات پیشنهادی</h2>
                <p className="muted section-text">
                  این بخش فقط پیشنهاد فروشگاه است و دیگر به‌جای آیتم‌های سبد نمایش داده نمی‌شود.
                </p>
              </div>
            </div>

            <div className="product-grid compact-grid">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
