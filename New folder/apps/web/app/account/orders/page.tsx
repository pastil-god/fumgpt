import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrderStatusMeta, listOrdersForCurrentUser } from "@/lib/checkout";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "سفارش‌های من",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountOrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/account/orders");
  }

  const orders = await listOrdersForCurrentUser(30);

  return (
    <section className="section">
      <div className="container section-stack">
        <div className="surface future-main">
          <div className="eyebrow">پیگیری سفارش</div>
          <h1 className="page-title">سفارش‌های من</h1>
          <p className="muted section-text">
            در این صفحه، وضعیت فعلی سفارش‌های ثبت‌شده روی همین حساب نمایش داده می‌شود. برای جزئیات بیشتر هر سفارش وارد صفحه همان سفارش شو.
          </p>
          <div className="btn-row">
            <Link href="/account" className="btn btn-ghost">
              بازگشت به حساب
            </Link>
            <Link href="/help" className="btn btn-secondary">
              راهنما و پشتیبانی
            </Link>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="order-history-list">
            {orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);

              return (
                <Link
                  key={order.id}
                  href={`/checkout/confirmation/${order.orderNumber}`}
                  className="order-history-item"
                >
                  <div className="order-history-copy">
                    <strong>{order.orderNumber}</strong>
                    <span className="muted">{formatPersianDate((order.placedAt || order.createdAt).toISOString())}</span>
                  </div>
                  <div className="order-history-meta">
                    <span className={statusMeta.toneClassName}>{statusMeta.label}</span>
                    <strong>{formatPriceIRR(order.subtotalAmount)} تومان</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="surface empty-state-card">
            <strong>هنوز سفارشی روی این حساب ثبت نشده است</strong>
            <p className="muted">
              بعد از ثبت سفارش، وضعیت و شماره سفارش از همین صفحه قابل پیگیری است. اگر مهمان خرید کرده‌ای، صفحه تایید سفارش و شماره سفارش مبنای پیگیری است.
            </p>
            <div className="btn-row">
              <Link href="/products" className="btn btn-primary">
                رفتن به فروشگاه
              </Link>
              <Link href="/help" className="btn btn-ghost">
                راهنمای پیگیری سفارش
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
