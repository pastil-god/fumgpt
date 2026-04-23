import Link from "next/link";
import {
  canAccessCmsOperations,
  canLookupUsers,
  canViewOrders,
  getAdminSectionsForRole,
  getCmsDashboardHref,
  requireOperationalSession,
  ROLE_ACCESS_MATRIX
} from "@/lib/authorization";

export default async function AdminOverviewPage() {
  const session = await requireOperationalSession("/admin");
  const sections = getAdminSectionsForRole(session.role);
  const cmsDashboardHref = getCmsDashboardHref();

  return (
    <>
      <div className="admin-grid">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="surface admin-card">
            <strong>{section.label}</strong>
            <p className="muted">{section.description}</p>
          </Link>
        ))}

        {canAccessCmsOperations(session.role) ? (
          cmsDashboardHref ? (
            <a className="surface admin-card" href={cmsDashboardHref} target="_blank" rel="noreferrer">
              <strong>مدیریت محتوا در Contentful</strong>
              <p className="muted">ویرایش محتوا، صفحات و تنظیمات برند همچنان از مسیر CMS انجام می‌شود.</p>
            </a>
          ) : (
            <div className="surface admin-card">
              <strong>مدیریت محتوا در Contentful</strong>
              <p className="muted">آدرس پنل CMS هنوز تنظیم نشده است. این بخش عمداً جایگزین Contentful نمی‌شود.</p>
            </div>
          )
        ) : null}
      </div>

      <div className="admin-grid">
        <div className="surface nested-card">
          <strong>مرزهای ساده دسترسی</strong>
          <div className="admin-role-list">
            {ROLE_ACCESS_MATRIX.map((item) => (
              <div key={item.role} className="admin-role-item">
                <strong>{item.label}</strong>
                <p className="muted">{item.summary}</p>
                <div className="chip-row">
                  {item.access.map((accessItem) => (
                    <span className="chip" key={`${item.role}-${accessItem}`}>
                      {accessItem}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface nested-card">
          <strong>وضعیت این نقش در حال حاضر</strong>
          <div className="admin-role-list">
            <div className="admin-role-item">
              <strong>سفارش‌ها</strong>
              <p className="muted">
                {canViewOrders(session.role)
                  ? "این حساب به فهرست و جزئیات سفارش‌ها دسترسی دارد."
                  : "این حساب به ابزارهای سفارش دسترسی ندارد."}
              </p>
            </div>
            <div className="admin-role-item">
              <strong>پشتیبانی و جست‌وجوی کاربر</strong>
              <p className="muted">
                {canLookupUsers(session.role)
                  ? "این حساب می‌تواند برای پشتیبانی، کاربرها را جست‌وجو کند."
                  : "این حساب ابزار جست‌وجوی کاربر را نمی‌بیند."}
              </p>
            </div>
            <div className="admin-role-item">
              <strong>مدیریت محتوا</strong>
              <p className="muted">
                {canAccessCmsOperations(session.role)
                  ? "این حساب می‌تواند از همین‌جا به Contentful وارد شود."
                  : "مدیریت محتوا برای این نقش از پنل داخلی فعال نشده است."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
