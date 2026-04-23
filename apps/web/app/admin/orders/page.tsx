import Link from "next/link";
import type { Metadata } from "next";
import {
  canUpdateOrderStatus,
  requireAuthorizedSession,
  ORDER_ADMIN_VIEWER_ROLES
} from "@/lib/authorization";
import { getOrderStatusMeta, ORDER_STATUS_VALUES } from "@/lib/checkout";
import { dbOrders } from "@/lib/db";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "سفارش‌ها"
};

type SearchParamsLike =
  | Promise<{
      q?: string | string[];
      status?: string | string[];
      updated?: string | string[];
      error?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    query: Array.isArray(params.q) ? params.q[0] : params.q || "",
    status: Array.isArray(params.status) ? params.status[0] : params.status || "",
    updated: Array.isArray(params.updated) ? params.updated[0] : params.updated,
    error: Array.isArray(params.error) ? params.error[0] : params.error
  };
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const [session, params] = await Promise.all([
    requireAuthorizedSession({
      allowedRoles: ORDER_ADMIN_VIEWER_ROLES,
      nextPath: "/admin/orders"
    }),
    resolveSearchParams(searchParams)
  ]);
  const orders = await dbOrders.listForAdmin({
    query: params.query,
    status: params.status || undefined,
    limit: 60
  });

  return (
    <>
      {params.updated === "1" ? (
        <div className="surface status-banner status-banner-success">
          <strong>وضعیت سفارش به‌روزرسانی شد</strong>
          <p>تغییر وضعیت در دیتابیس ثبت شد و این فهرست از داده واقعی فروشگاه استفاده می‌کند.</p>
        </div>
      ) : null}

      {params.error ? (
        <div className="surface status-banner status-banner-warning">
          <strong>به‌روزرسانی سفارش انجام نشد</strong>
          <p>
            {params.error === "invalid-transition"
              ? "انتقال انتخاب‌شده برای این سفارش مجاز نیست."
              : params.error === "invalid-status"
                ? "وضعیت انتخاب‌شده معتبر نیست."
                : params.error === "order-not-found"
                  ? "سفارش پیدا نشد."
                  : "در ثبت تغییر وضعیت مشکلی پیش آمد."}
          </p>
        </div>
      ) : null}

      <div className="surface nested-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">عملیات سفارش</div>
            <h2 className="section-title">فهرست سفارش‌ها</h2>
            <p className="muted section-text">
              {canUpdateOrderStatus(session.role)
                ? "این نقش می‌تواند وضعیت سفارش را هم تغییر دهد."
                : "این نقش فقط مشاهده‌گر است و برای تغییر وضعیت باید از اپراتور سفارش یا مدیر کل استفاده شود."}
            </p>
          </div>
          <span className="chip">{orders.length.toLocaleString("fa-IR")} سفارش</span>
        </div>

        <form className="admin-filter-form" method="get">
          <label className="checkout-field">
            <span>جست‌وجو</span>
            <input
              type="search"
              name="q"
              defaultValue={params.query}
              placeholder="شماره سفارش، نام، ایمیل یا شماره تماس"
            />
          </label>

          <label className="checkout-field">
            <span>وضعیت</span>
            <select name="status" defaultValue={params.status}>
              <option value="">همه وضعیت‌ها</option>
              {ORDER_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {getOrderStatusMeta(status).label}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-filter-actions">
            <button className="btn btn-primary" type="submit">
              اعمال فیلتر
            </button>
            <Link className="btn btn-ghost" href="/admin/orders">
              پاک‌کردن
            </Link>
          </div>
        </form>

        {orders.length > 0 ? (
          <div className="admin-list">
            {orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const customerIdentifier =
                order.user?.email ||
                order.user?.phone ||
                order.customerEmail ||
                order.customerPhone;

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.orderNumber}`}
                  className="admin-list-item"
                >
                  <div className="admin-list-copy">
                    <strong>{order.orderNumber}</strong>
                    <span className="muted">{order.customerName}</span>
                    <span className="muted">{customerIdentifier}</span>
                  </div>
                  <div className="admin-list-meta">
                    <span className={statusMeta.toneClassName}>{statusMeta.label}</span>
                    <span className="muted">
                      {formatPersianDate((order.placedAt || order.createdAt).toISOString())}
                    </span>
                    <strong>{formatPriceIRR(order.subtotalAmount)} تومان</strong>
                    <span className="muted">
                      {order._count.items.toLocaleString("fa-IR")} ردیف
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <strong>سفارشی پیدا نشد</strong>
            <p className="muted">فیلترها را عوض کنید یا بدون فیلتر دوباره فهرست را ببینید.</p>
          </div>
        )}
      </div>
    </>
  );
}
