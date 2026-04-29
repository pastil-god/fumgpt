import Link from "next/link";
import type { Metadata } from "next";
import {
  canManageRoles,
  requireAuthorizedSession,
  ROLE_LABELS,
  SUPPORT_LOOKUP_ROLES
} from "@/lib/authorization";
import { APP_ROLES } from "@/lib/auth";
import { getOrderStatusMeta } from "@/lib/checkout";
import { dbUsers } from "@/lib/db";
import { formatPersianDate } from "@/lib/content";
import { formatPriceIRR } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "کاربران و نقش‌ها"
};

type SearchParamsLike =
  | Promise<{
      q?: string | string[];
      error?: string | string[];
      roleUpdated?: string | string[];
    }>
  | undefined;

async function resolveSearchParams(searchParams: SearchParamsLike) {
  const params = (await searchParams) || {};

  return {
    query: Array.isArray(params.q) ? params.q[0] : params.q || "",
    error: Array.isArray(params.error) ? params.error[0] : params.error,
    roleUpdated: Array.isArray(params.roleUpdated) ? params.roleUpdated[0] : params.roleUpdated
  };
}

function getRoleUpdateMessage(error?: string) {
  switch (error) {
    case "role-denied":
      return "این حساب اجازه تغییر نقش ندارد.";
    case "invalid-role":
      return "نقش انتخاب‌شده معتبر نیست.";
    case "user-not-found":
      return "کاربر پیدا نشد.";
    case "cannot-downgrade-self":
      return "برای امنیت، نمی‌توانی نقش super admin خودت را از همین فرم کم کنی.";
    case "last-super-admin":
      return "حداقل یک super admin باید در سیستم باقی بماند.";
    default:
      return null;
  }
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: SearchParamsLike;
}) {
  const session = await requireAuthorizedSession({
    allowedRoles: SUPPORT_LOOKUP_ROLES,
    nextPath: "/admin/users"
  });
  const params = await resolveSearchParams(searchParams);
  const users = params.query ? await dbUsers.searchForAdminLookup(params.query) : [];
  const canEditRoles = canManageRoles(session.role);
  const roleError = getRoleUpdateMessage(params.error);

  return (
    <div className="surface nested-card admin-users-panel">
      <div className="section-header">
        <div>
          <div className="eyebrow">پشتیبانی و کنترل دسترسی</div>
          <h2 className="section-title">کاربران و نقش‌ها</h2>
          <p className="muted section-text">
            کاربر را با ایمیل، شماره تماس یا نام نمایشی پیدا کن. super admin می‌تواند نقش‌ها را با ثبت audit تغییر دهد.
          </p>
        </div>
      </div>

      {params.roleUpdated ? (
        <div className="status-banner success">
          <strong>نقش کاربر به‌روزرسانی شد</strong>
          <p>برای اعمال دسترسی جدید، کاربر بهتر است یک بار logout/login کند.</p>
        </div>
      ) : null}

      {roleError ? (
        <div className="status-banner danger">
          <strong>تغییر نقش انجام نشد</strong>
          <p>{roleError}</p>
        </div>
      ) : null}

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
          <p className="muted">برای حفظ امنیت، فهرست همه کاربران نمایش داده نمی‌شود. ابتدا عبارت جست‌وجو وارد کن.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty-state">
          <strong>کاربری پیدا نشد</strong>
          <p className="muted">عبارت دیگری امتحان کنید یا با شماره تماس و ایمیل دقیق‌تر جست‌وجو کنید.</p>
        </div>
      ) : (
        <div className="admin-role-list">
          {users.map((user) => (
            <div key={user.id} className="admin-user-card admin-user-card-premium">
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

              {canEditRoles ? (
                <form className="admin-role-update-form" action="/api/admin/users/role" method="post">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="redirectTo" value={`/admin/users?q=${encodeURIComponent(params.query)}`} />
                  <label className="checkout-field">
                    <span>نقش کاربر</span>
                    <select name="role" defaultValue={user.role}>
                      {APP_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="btn btn-secondary" type="submit">
                    ذخیره نقش
                  </button>
                </form>
              ) : null}

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
