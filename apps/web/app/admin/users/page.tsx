import Link from "next/link";
import type { Metadata } from "next";
import {
  requireAuthorizedSession,
  ROLE_LABELS,
  SUPPORT_LOOKUP_ROLES
} from "@/lib/authorization";
import { getOrderStatusMeta } from "@/lib/checkout";
import { dbUsers } from "@/lib/db";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "جست‌وجوی کاربران"
};

type SearchParamsLike =
  | Promise<{
      q?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    query: Array.isArray(params.q) ? params.q[0] : params.q || ""
  };
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  await requireAuthorizedSession({
    allowedRoles: SUPPORT_LOOKUP_ROLES,
    nextPath: "/admin/users"
  });
  const params = await resolveSearchParams(searchParams);
  const users = params.query ? await dbUsers.searchForAdminLookup(params.query) : [];

  return (
    <div className="surface nested-card">
      <div className="section-header">
        <div>
          <div className="eyebrow">پشتیبانی داخلی</div>
          <h2 className="section-title">جست‌وجوی کاربران</h2>
          <p className="muted section-text">
            برای پشتیبانی پایه، با ایمیل، شماره تماس یا نام نمایشی کاربر را پیدا کنید.
          </p>
        </div>
      </div>

      <form className="admin-filter-form" method="get">
        <label className="checkout-field">
          <span>عبارت جست‌وجو</span>
          <input
            type="search"
            name="q"
            defaultValue={params.query}
            placeholder="ایمیل، شماره تماس یا نام کاربر"
          />
        </label>

        <div className="admin-filter-actions">
          <button className="btn btn-primary" type="submit">
            جست‌وجو
          </button>
          <Link className="btn btn-ghost" href="/admin/users">
            پاک‌کردن
          </Link>
        </div>
      </form>

      {!params.query ? (
        <div className="admin-empty-state">
          <strong>جست‌وجو را شروع کنید</strong>
          <p className="muted">برای حفظ سادگی و سرعت، این صفحه فقط وقتی جست‌وجو انجام شود داده‌ها را نشان می‌دهد.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty-state">
          <strong>کاربری پیدا نشد</strong>
          <p className="muted">عبارت دیگری امتحان کنید یا با شماره تماس و ایمیل دقیق‌تر جست‌وجو کنید.</p>
        </div>
      ) : (
        <div className="admin-role-list">
          {users.map((user) => (
            <div key={user.id} className="admin-user-card">
              <div className="section-header">
                <div>
                  <strong>{user.profile?.displayName || user.email || user.phone || user.id}</strong>
                  <p className="muted">
                    {[user.email, user.phone].filter(Boolean).join(" / ") || "شناسه مستقیم دیتابیس"}
                  </p>
                </div>
                <span className="chip">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</span>
              </div>

              <div className="info-grid-card">
                <div>
                  <div className="eyebrow">تاریخ عضویت</div>
                  <p className="muted">{formatPersianDate(user.createdAt.toISOString())}</p>
                </div>
                <div>
                  <div className="eyebrow">تعداد سفارش‌ها</div>
                  <p className="muted">{user._count.orders.toLocaleString("fa-IR")}</p>
                </div>
                <div>
                  <div className="eyebrow">درخواست‌های پشتیبانی</div>
                  <p className="muted">{user._count.supportRequests.toLocaleString("fa-IR")}</p>
                </div>
              </div>

              {user.orders.length > 0 ? (
                <div className="admin-mini-list">
                  {user.orders.map((order) => {
                    const statusMeta = getOrderStatusMeta(order.status);

                    return (
                      <Link key={order.id} href={`/admin/orders/${order.orderNumber}`} className="admin-mini-list-item">
                        <div>
                          <strong>{order.orderNumber}</strong>
                          <span className="muted">
                            {formatPersianDate((order.placedAt || order.createdAt).toISOString())}
                          </span>
                        </div>
                        <div className="admin-list-meta">
                          <span className={statusMeta.toneClassName}>{statusMeta.label}</span>
                          <strong>{formatPriceIRR(order.subtotalAmount)} تومان</strong>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">برای این کاربر هنوز سفارشی ثبت نشده است.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
