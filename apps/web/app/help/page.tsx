import Link from "next/link";
import type { Metadata } from "next";
import { OperationalContentPage } from "@/components/operational-content-page";
import { getSession } from "@/lib/auth";
import { getStorefrontSettings } from "@/lib/content";
import { helpPageSections, operationalFaqs, orderStatusGuide } from "@/lib/operations-content";
import { buildPublicMetadata } from "@/lib/seo";
import { isExternalHref } from "@/lib/site";

export const metadata: Metadata = buildPublicMetadata({
  title: "راهنما و پشتیبانی",
  description: "راهنمای ارتباط با فروشگاه، کانال‌های پشتیبانی، وضعیت‌های سفارش و مسیرهای پیگیری برای کاربران واقعی.",
  path: "/help"
});

export default async function HelpPage() {
  const [settings, session] = await Promise.all([getStorefrontSettings(), getSession()]);
  const helpActions: Array<{
    href: string;
    label: string;
    tone?: "primary" | "secondary" | "ghost";
  }> = [
    { href: "/faq", label: "پرسش‌های متداول", tone: "secondary" },
    { href: "/delivery", label: "تحویل و پیگیری سفارش", tone: "ghost" }
  ];

  if (session) {
    helpActions.unshift({ href: "/account/orders", label: "پیگیری سفارش‌های من", tone: "primary" });
  } else {
    helpActions.unshift({ href: "/login?next=/account/orders", label: "ورود برای پیگیری سفارش", tone: "primary" });
  }

  return (
    <OperationalContentPage
      content={{
        eyebrow: "راهنمای عملیاتی",
        title: "راهنما و پشتیبانی",
        intro:
          "این صفحه برای روشن‌کردن مسیر ارتباط با فروشگاه ساخته شده است. اگر پیش از خرید سوال داری، سفارشی ثبت کرده‌ای، یا می‌خواهی بدانی در این فاز چه چیزهایی هنوز دستی انجام می‌شوند، از همین‌جا شروع کن.",
        highlights: [
          "پشتیبانی در این فاز سبک و عملیاتی است",
          "پیگیری سفارش بر اساس شماره سفارش انجام می‌شود",
          "وعده‌هایی که هنوز زنده نشده‌اند به‌صراحت جدا شده‌اند"
        ],
        sections: helpPageSections
      }}
      actions={helpActions}
      aside={
        <>
          <div className="surface nested-card">
            <strong>کانال‌های پشتیبانی</strong>
            <p className="muted">
              اگر مسئله‌ات به سفارش ثبت‌شده مربوط است، شماره سفارش را در اولین پیام بفرست تا پیگیری سریع‌تر
              انجام شود.
            </p>
            <div className="footer-links operational-links">
              <a href={`mailto:${settings.support.email}`}>{settings.support.email}</a>
              <span>{settings.support.phone}</span>
              <span>{settings.support.address}</span>
              {isExternalHref(settings.support.helpCtaHref) ? (
                <a href={settings.support.helpCtaHref} target="_blank" rel="noreferrer">
                  {settings.support.helpCtaLabel}
                </a>
              ) : (
                <Link href={settings.support.helpCtaHref}>{settings.support.helpCtaLabel}</Link>
              )}
            </div>
          </div>

          <div className="surface nested-card">
            <strong>وضعیت‌های سفارش</strong>
            <div className="status-guide-list">
              {orderStatusGuide.map((item) => (
                <div key={item.key} className="status-guide-item">
                  <strong>{item.label}</strong>
                  <p className="muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface nested-card">
            <strong>پرسش‌های پرتکرار</strong>
            <div className="faq-list">
              {operationalFaqs.slice(0, 3).map((item) => (
                <div key={item.question} className="faq-item">
                  <strong>{item.question}</strong>
                  <p className="muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}
