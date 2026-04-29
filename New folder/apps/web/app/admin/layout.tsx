import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  canAccessCmsOperations,
  getAdminSectionsForRole,
  getCmsDashboardHref,
  requireOperationalSession,
  ROLE_LABELS
} from "@/lib/authorization";

export const metadata: Metadata = {
  title: "ابزارهای داخلی",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await requireOperationalSession("/admin");
  const sections = getAdminSectionsForRole(session.role);
  const cmsDashboardHref = getCmsDashboardHref();

  return (
    <section className="section">
      <div className="container section-stack">
        <div className="surface admin-shell">
          <div className="admin-shell-header">
            <div>
              <div className="eyebrow">عملیات داخلی فروشگاه</div>
              <h1 className="page-title">ابزارهای داخلی</h1>
              <p className="muted section-text">
                از اینجا تنظیمات برند، صفحه اصلی، سفارش‌ها، کاربران و نقش‌های داخلی را مدیریت می‌کنی. محصولات و خبرهای سنگین‌تر می‌توانند همچنان از CMS بیایند.
              </p>
            </div>

            <div className="chip-row">
              <span className="chip">{ROLE_LABELS[session.role]}</span>
              <Link className="btn btn-ghost" href="/account">
                بازگشت به حساب
              </Link>
            </div>
          </div>

          <div className="admin-nav-row">
            {sections.map((section) => (
              <Link key={section.href} href={section.href} className="admin-nav-link">
                <strong>{section.label}</strong>
                <span className="muted">{section.description}</span>
              </Link>
            ))}

            {cmsDashboardHref && canAccessCmsOperations(session.role) ? (
              <a className="admin-nav-link" href={cmsDashboardHref} target="_blank" rel="noreferrer">
                <strong>Contentful</strong>
                <span className="muted">ورود به پنل مدیریت محتوا</span>
              </a>
            ) : null}
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
