import Image from "next/image";
import Link from "next/link";
import {
  canAccessCmsOperations,
  canLookupUsers,
  canManageHomepageSettings,
  canManageProducts,
  canManageRoles,
  canManageSiteSettings,
  canViewOrders,
  getAdminSectionsForRole,
  getCmsDashboardHref,
  requireOperationalSession,
  ROLE_ACCESS_MATRIX,
  ROLE_LABELS
} from "@/lib/authorization";

export default async function AdminOverviewPage() {
  const session = await requireOperationalSession("/admin");
  const sections = getAdminSectionsForRole(session.role);
  const cmsDashboardHref = getCmsDashboardHref();

  const quickStats = [
    {
      label: "نقش فعال",
      value: ROLE_LABELS[session.role],
      description: "سطح دسترسی فعلی این حساب"
    },
    {
      label: "تنظیمات سایت",
      value: canManageSiteSettings(session.role) ? "فعال" : "محدود",
      description: canManageSiteSettings(session.role) ? "امکان تغییر برند و SEO" : "فقط super admin"
    },
    {
      label: "صفحه اصلی",
      value: canManageHomepageSettings(session.role) ? "قابل ویرایش" : "محدود",
      description: "Hero، CTAها و سکشن‌های اصلی"
    },
    {
      label: "سفارش‌ها",
      value: canViewOrders(session.role) ? "قابل مشاهده" : "بدون دسترسی",
      description: "پیگیری و عملیات سفارش"
    },
    {
      label: "محصولات داخلی",
      value: canManageProducts(session.role) ? "قابل مدیریت" : "بدون دسترسی",
      description: "ایجاد و ویرایش محصولات بدون تغییر کد"
    }
  ];

  return (
    <>
      <div className="surface admin-command-center">
        <div className="admin-command-copy">
          <div className="eyebrow">Super Admin Command Center</div>
          <h2 className="section-title">کنترل فروشگاه، محتوا و عملیات از یک پنل</h2>
          <p className="muted section-text">
            این داشبورد برای مدیریت سریع فروشگاه ساخته شده: تنظیمات برند، صفحه اصلی، سفارش‌ها، کاربران و مسیرهای محتوا از همین‌جا قابل دسترسی‌اند.
          </p>
          <div className="admin-command-actions">
            {canManageSiteSettings(session.role) ? (
              <Link className="btn btn-primary" href="/admin/settings">
                تنظیمات سایت
              </Link>
            ) : null}
            {canManageHomepageSettings(session.role) ? (
              <Link className="btn btn-secondary" href="/admin/homepage">
                مدیریت صفحه اصلی
              </Link>
            ) : null}
            {canManageProducts(session.role) ? (
              <Link className="btn btn-secondary" href="/admin/products">
                مدیریت محصولات
              </Link>
            ) : null}
            {canViewOrders(session.role) ? (
              <Link className="btn btn-ghost" href="/admin/orders">
                سفارش‌ها
              </Link>
            ) : null}
          </div>
        </div>
        <div className="admin-command-art" aria-hidden="true">
          <Image src="/illustrations/admin-control-center.svg" alt="" width={520} height={390} />
        </div>
      </div>

      <div className="admin-metrics-grid">
        {quickStats.map((item) => (
          <div className="surface admin-metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p className="muted">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="admin-grid admin-action-grid">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="surface admin-card admin-card-action">
            <span className="admin-card-icon" aria-hidden="true">●</span>
            <strong>{section.label}</strong>
            <p className="muted">{section.description}</p>
          </Link>
        ))}

        {canAccessCmsOperations(session.role) ? (
          cmsDashboardHref ? (
            <a className="surface admin-card admin-card-action" href={cmsDashboardHref} target="_blank" rel="noreferrer">
              <span className="admin-card-icon" aria-hidden="true">↗</span>
              <strong>Contentful</strong>
              <p className="muted">برای محصولات، خبرها و محتوای سنگین‌تر وارد پنل CMS شو.</p>
            </a>
          ) : (
            <div className="surface admin-card admin-card-action">
              <span className="admin-card-icon" aria-hidden="true">!</span>
              <strong>Contentful هنوز وصل نیست</strong>
              <p className="muted">برای محصولات و خبرها می‌توانی بعداً لینک CMS را در env تنظیم کنی.</p>
            </div>
          )
        ) : null}
      </div>

      <div className="admin-grid">
        <div className="surface nested-card admin-role-matrix-card">
          <div className="section-header">
            <div>
              <div className="eyebrow">Role-based access</div>
              <h2 className="section-title">مرزهای دسترسی</h2>
              <p className="muted section-text">برای امنیت، هر نقش فقط ابزارهای لازم خودش را می‌بیند.</p>
            </div>
          </div>
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

        <div className="surface nested-card admin-next-steps-card">
          <div className="eyebrow">وضعیت نقش فعلی</div>
          <h2 className="section-title">چه کارهایی می‌توانی انجام بدهی؟</h2>
          <div className="admin-role-list">
            <div className="admin-role-item">
              <strong>تنظیمات برند</strong>
              <p className="muted">
                {canManageSiteSettings(session.role)
                  ? "این حساب می‌تواند تنظیمات برند، تماس، SEO و رنگ‌های اصلی را تغییر دهد."
                  : "تنظیمات حساس فقط برای super admin فعال است."}
              </p>
            </div>
            <div className="admin-role-item">
              <strong>محتوای صفحه اصلی</strong>
              <p className="muted">
                {canManageHomepageSettings(session.role)
                  ? "این حساب می‌تواند متن hero، CTAها و سکشن‌های اصلی را ویرایش کند."
                  : "این حساب به مدیریت صفحه اصلی دسترسی ندارد."}
              </p>
            </div>
            <div className="admin-role-item">
              <strong>کاربران و نقش‌ها</strong>
              <p className="muted">
                {canManageRoles(session.role)
                  ? "این حساب می‌تواند نقش کاربران را تغییر دهد و تغییرات در audit ثبت می‌شوند."
                  : canLookupUsers(session.role)
                    ? "این حساب می‌تواند کاربرها را برای پشتیبانی جست‌وجو کند."
                    : "این حساب ابزار جست‌وجوی کاربر را نمی‌بیند."}
              </p>
            </div>
            <div className="admin-role-item">
              <strong>سفارش‌ها</strong>
              <p className="muted">
                {canViewOrders(session.role)
                  ? "این حساب به فهرست و جزئیات سفارش‌ها دسترسی دارد."
                  : "این حساب به ابزارهای سفارش دسترسی ندارد."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
