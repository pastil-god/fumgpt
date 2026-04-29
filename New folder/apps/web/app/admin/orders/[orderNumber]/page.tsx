import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  canLookupUsers,
  canUpdateOrderStatus,
  requireAuthorizedSession,
  ORDER_ADMIN_VIEWER_ROLES
} from "@/lib/authorization";
import { getAllowedOrderStatusUpdates, getOrderStatusMeta } from "@/lib/checkout";
import { dbOrders } from "@/lib/db";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";

type ParamsLike = Promise<{ orderNumber: string }>;
type SearchParamsLike =
  | Promise<{
      updated?: string | string[];
      error?: string | string[];
    }>
  | undefined;

async function resolveParams(params: ParamsLike) {
  return await params;
}

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    updated: Array.isArray(params.updated) ? params.updated[0] : params.updated,
    error: Array.isArray(params.error) ? params.error[0] : params.error
  };
}

export async function generateMetadata({
  params
}: {
  params: ParamsLike;
}): Promise<Metadata> {
  const resolvedParams = await resolveParams(params);

  return {
    title: `سفارش ${resolvedParams.orderNumber}`
  };
}

export default async function AdminOrderDetailPage({
  params,
  searchParams
}: {
  params: ParamsLike;
  searchParams?: SearchParamsLike;
}) {
  const [session, resolvedParams, resolvedSearchParams] = await Promise.all([
    requireAuthorizedSession({
      allowedRoles: ORDER_ADMIN_VIEWER_ROLES,
      nextPath: "/admin/orders"
    }),
    resolveParams(params),
    resolveSearchParams(searchParams)
  ]);
  const order = await dbOrders.findByOrderNumberForAdmin(resolvedParams.orderNumber);

  if (!order) {
    notFound();
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const canEditStatus = canUpdateOrderStatus(session.role);
  const statusOptions = getAllowedOrderStatusUpdates(order.status);
  const supportLookupTarget = order.user?.email || order.user?.phone || order.customerPhone;

  return (
    <>
      {resolvedSearchParams.updated === "1" ? (
        <div className="surface status-banner status-banner-success">
          <strong>وضعیت سفارش ذخیره شد</strong>
          <p>تغییر وضعیت این سفارش ثبت شد و برای پیگیری بعدی در همین صفحه قابل مشاهده است.</p>
        </div>
      ) : null}

      {resolvedSearchParams.error ? (
        <div className="surface status-banner status-banner-warning">
          <strong>تغییر وضعیت سفارش انجام نشد</strong>
          <p>
            {resolvedSearchParams.error === "invalid-transition"
              ? "انتقال انتخاب‌شده برای این سفارش مجاز نیست."
              : resolvedSearchParams.error === "invalid-status"
                ? "وضعیت انتخاب‌شده معتبر نیست."
                : "در ثبت تغییر وضعیت مشکلی پیش آمد."}
          </p>
        </div>
      ) : null}

      <div className="checkout-layout">
        <div className="surface checkout-form-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">جزئیات سفارش</div>
              <h2 className="section-title">{order.orderNumber}</h2>
              <p className="muted section-text">این صفحه برای پیگیری داخلی سفارش و پشتیبانی استفاده می‌شود.</p>
            </div>
            <span className={statusMeta.toneClassName}>{statusMeta.label}</span>
          </div>

          <div className="info-grid-card">
            <div>
              <div className="eyebrow">تاریخ ثبت</div>
              <p className="muted">{formatPersianDate((order.placedAt || order.createdAt).toISOString())}</p>
            </div>
            <div>
              <div className="eyebrow">جمع سفارش</div>
              <p className="muted">{formatPriceIRR(order.subtotalAmount)} تومان</p>
            </div>
            <div>
              <div className="eyebrow">روش پرداخت</div>
              <p className="muted">{order.paymentProvider}</p>
            </div>
            <div>
              <div className="eyebrow">مرجع پرداخت</div>
              <p className="muted">{order.paymentReference || "ثبت نشده"}</p>
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
              <div>
                <div className="eyebrow">ایمیل</div>
                <p className="muted">{order.customerEmail || "ثبت نشده"}</p>
              </div>
              <div>
                <div className="eyebrow">کاربر متصل</div>
                <p className="muted">
                  {order.user ? order.user.profile?.displayName || order.user.email || order.user.phone : "مهمان"}
                </p>
              </div>
            </div>

            {canLookupUsers(session.role) && supportLookupTarget ? (
              <div className="btn-row">
                <Link className="btn btn-ghost" href={`/admin/users?q=${encodeURIComponent(supportLookupTarget)}`}>
                  جست‌وجوی این کاربر
                </Link>
              </div>
            ) : null}
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
                  <div className="eyebrow">شماره تماس</div>
                  <p className="muted">{order.shippingPhone || order.customerPhone}</p>
                </div>
                <div>
                  <div className="eyebrow">استان و شهر</div>
                  <p className="muted">{[order.shippingProvince, order.shippingCity].filter(Boolean).join(" / ")}</p>
                </div>
                <div>
                  <div className="eyebrow">نشانی</div>
                  <p className="muted">{[order.shippingAddressLine1, order.shippingAddressLine2].filter(Boolean).join(" - ")}</p>
                </div>
              </div>
            </div>
          ) : null}

          {order.notes ? (
            <div className="surface nested-card">
              <strong>یادداشت سفارش</strong>
              <p className="muted">{order.notes}</p>
            </div>
          ) : null}

          <div className="surface nested-card">
            <strong>وضعیت عملیاتی</strong>
            {canEditStatus ? (
              <form action="/api/admin/orders/status" method="post" className="admin-status-form">
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <input type="hidden" name="redirectTo" value={`/admin/orders/${order.orderNumber}`} />

                <label className="checkout-field">
                  <span>وضعیت جدید</span>
                  <select name="status" defaultValue={order.status}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getOrderStatusMeta(status).label}
                      </option>
                    ))}
                  </select>
                </label>

                <button className="btn btn-primary" type="submit">
                  ذخیره وضعیت
                </button>
              </form>
            ) : (
              <p className="muted">این نقش فقط مشاهده‌گر است و اجازه تغییر وضعیت سفارش را ندارد.</p>
            )}
          </div>
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
              <span>شناسه کاربر</span>
              <strong>{order.userId || "مهمان"}</strong>
            </div>
            <div>
              <span>شناسه سبد مبدا</span>
              <strong>{order.sourceCartId || "ثبت نشده"}</strong>
            </div>
          </div>

          <div className="btn-row">
            <Link className="btn btn-ghost" href="/admin/orders">
              بازگشت به فهرست سفارش‌ها
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
