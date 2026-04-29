import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  canShowDevelopmentPaymentTools,
  getOrderForCurrentViewer,
  getOrderStatusMeta,
  getOrderTimelineMessage
} from "@/lib/checkout";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";
import { getPaymentProviderPresentationByKey } from "@/lib/payment";

type ParamsLike = Promise<{ orderNumber: string }>;
type SearchParamsLike =
  | Promise<{
      placed?: string | string[];
      payment?: string | string[];
      paymentError?: string | string[];
    }>
  | undefined;

async function resolveParams(params: ParamsLike) {
  return await params;
}

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    placed: Array.isArray(params.placed) ? params.placed[0] : params.placed,
    payment: Array.isArray(params.payment) ? params.payment[0] : params.payment,
    paymentError: Array.isArray(params.paymentError) ? params.paymentError[0] : params.paymentError
  };
}

export async function generateMetadata({
  params
}: {
  params: ParamsLike;
}): Promise<Metadata> {
  const resolvedParams = await resolveParams(params);

  return {
    title: `سفارش ${resolvedParams.orderNumber}`,
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function OrderConfirmationPage({
  params,
  searchParams
}: {
  params: ParamsLike;
  searchParams?: SearchParamsLike;
}) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    resolveParams(params),
    resolveSearchParams(searchParams)
  ]);
  const order = await getOrderForCurrentViewer(resolvedParams.orderNumber);

  if (!order) {
    notFound();
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const paymentProvider = getPaymentProviderPresentationByKey(order.paymentProvider);
  const showDevelopmentPaymentTools = canShowDevelopmentPaymentTools({
    status: order.status,
    paymentProvider: order.paymentProvider
  });

  return (
    <section className="section">
      <div className="container section-stack">
        {resolvedSearchParams.placed === "1" ? (
          <div className="surface status-banner status-banner-success">
            <strong>سفارش شما ثبت شد</strong>
            <p>شماره سفارش {order.orderNumber} ساخته شد و از این لحظه در دیتابیس فروشگاه ثبت شده است.</p>
          </div>
        ) : null}

        {resolvedSearchParams.payment === "paid" ? (
          <div className="surface status-banner status-banner-success">
            <strong>پرداخت توسعه‌ای با موفقیت شبیه‌سازی شد</strong>
            <p>این تغییر فقط برای تست محیط توسعه انجام شده و پرداخت زنده نیست.</p>
          </div>
        ) : null}

        {resolvedSearchParams.payment === "failed" ? (
          <div className="surface status-banner status-banner-warning">
            <strong>پرداخت توسعه‌ای به حالت ناموفق تغییر کرد</strong>
            <p>این تغییر فقط برای تست flow سفارش و وضعیت‌ها استفاده می‌شود.</p>
          </div>
        ) : null}

        {resolvedSearchParams.paymentError === "dev-tools-disabled" ? (
          <div className="surface status-banner status-banner-warning">
            <strong>ابزار توسعه‌ای پرداخت فعال نیست</strong>
            <p>این ابزار فقط در حالت `dev_mock` و خارج از production در دسترس است.</p>
          </div>
        ) : null}

        <div className="checkout-layout">
          <div className="surface checkout-form-card">
            <div className="section-header">
              <div>
                <div className="eyebrow">تایید سفارش</div>
                <h1 className="page-title">سفارش {order.orderNumber}</h1>
                <p className="muted section-text">
                  {getOrderTimelineMessage({
                    status: order.status,
                    paymentProvider: order.paymentProvider
                  })}
                </p>
              </div>
              <span className={statusMeta.toneClassName}>{statusMeta.label}</span>
            </div>

            <div className="info-grid-card">
              <div>
                <div className="eyebrow">تاریخ ثبت</div>
                <p className="muted">{formatPersianDate((order.placedAt || order.createdAt).toISOString())}</p>
              </div>
              <div>
                <div className="eyebrow">روش پرداخت</div>
                <p className="muted">{paymentProvider.label}</p>
              </div>
              <div>
                <div className="eyebrow">جمع سفارش</div>
                <p className="muted">{formatPriceIRR(order.subtotalAmount)} تومان</p>
              </div>
            </div>

            <div className="surface nested-card">
              <strong>اطلاعات مشتری</strong>
              <div className="order-detail-grid">
                <div>
                  <div className="eyebrow">نام</div>
                  <p className="muted">{order.customerName}</p>
                </div>
                <div>
                  <div className="eyebrow">شماره تماس</div>
                  <p className="muted">{order.customerPhone}</p>
                </div>
                {order.customerEmail ? (
                  <div>
                    <div className="eyebrow">ایمیل</div>
                    <p className="muted">{order.customerEmail}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {order.shippingProvince || order.shippingCity || order.shippingAddressLine1 ? (
              <div className="surface nested-card">
                <strong>اطلاعات ارسال</strong>
                <div className="order-detail-grid">
                  <div>
                    <div className="eyebrow">گیرنده</div>
                    <p className="muted">{order.shippingRecipientName || order.customerName}</p>
                  </div>
                  <div>
                    <div className="eyebrow">شماره تماس گیرنده</div>
                    <p className="muted">{order.shippingPhone || order.customerPhone}</p>
                  </div>
                  <div>
                    <div className="eyebrow">استان و شهر</div>
                    <p className="muted">{[order.shippingProvince, order.shippingCity].filter(Boolean).join(" / ")}</p>
                  </div>
                  <div>
                    <div className="eyebrow">نشانی</div>
                    <p className="muted">
                      {[order.shippingAddressLine1, order.shippingAddressLine2].filter(Boolean).join(" - ")}
                    </p>
                  </div>
                  {order.shippingPostalCode ? (
                    <div>
                      <div className="eyebrow">کد پستی</div>
                      <p className="muted">{order.shippingPostalCode}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {order.notes ? (
              <div className="surface nested-card">
                <strong>توضیح سفارش</strong>
                <p className="muted">{order.notes}</p>
              </div>
            ) : null}

            {showDevelopmentPaymentTools ? (
              <div className="surface nested-card">
                <strong>ابزار تست پرداخت</strong>
                <p className="muted">
                  این بخش فقط برای محیط توسعه است و برای تست flow وضعیت سفارش استفاده می‌شود.
                </p>
                <div className="btn-row">
                  <form action="/api/checkout/dev-payment" method="post">
                    <input type="hidden" name="orderNumber" value={order.orderNumber} />
                    <input type="hidden" name="paymentAction" value="paid" />
                    <button className="btn btn-primary" type="submit">
                      شبیه‌سازی پرداخت موفق
                    </button>
                  </form>
                  <form action="/api/checkout/dev-payment" method="post">
                    <input type="hidden" name="orderNumber" value={order.orderNumber} />
                    <input type="hidden" name="paymentAction" value="failed" />
                    <button className="btn btn-ghost" type="submit">
                      شبیه‌سازی پرداخت ناموفق
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="surface order-summary-card">
            <div className="eyebrow">اقلام سفارش</div>
            <div className="order-item-list">
              {order.items.map((item) => (
                <div className="order-item-row" key={item.id}>
                  <div>
                    <strong>{item.titleSnapshot}</strong>
                    <span className="muted">{item.quantity.toLocaleString("fa-IR")} عدد</span>
                  </div>
                  <strong>{formatPriceIRR(item.unitPrice * item.quantity)} تومان</strong>
                </div>
              ))}
            </div>

            <div className="checkout-lines">
              <div>
                <span>تعداد ردیف‌ها</span>
                <strong>{order.items.length.toLocaleString("fa-IR")}</strong>
              </div>
              <div>
                <span>جمع سفارش</span>
                <strong>{formatPriceIRR(order.subtotalAmount)} تومان</strong>
              </div>
              <div>
                <span>وضعیت</span>
                <strong>{statusMeta.label}</strong>
              </div>
            </div>

            <div className="btn-row">
              <Link className="btn btn-primary" href="/account/orders">
                مشاهده سفارش‌های من
              </Link>
              <Link className="btn btn-secondary" href="/help">
                راهنما و پشتیبانی
              </Link>
              <Link className="btn btn-ghost" href="/account">
                حساب کاربری
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
