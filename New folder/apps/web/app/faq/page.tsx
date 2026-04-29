import Link from "next/link";
import type { Metadata } from "next";
import { operationalFaqs } from "@/lib/operations-content";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "پرسش‌های متداول",
  description: "پاسخ‌های روشن به سوال‌های پرتکرار درباره پرداخت، سفارش، آکادمی، تحویل و پشتیبانی.",
  path: "/faq"
});

export default function FaqPage() {
  return (
    <section className="section">
      <div className="container section-stack">
        <div className="surface future-main">
          <div className="eyebrow">پرسش‌های متداول عملیاتی</div>
          <h1 className="page-title">پرسش‌های متداول</h1>
          <p className="muted section-text">
            این بخش برای پاسخ‌دادن به سوال‌های واقعی کاربران نوشته شده است: وضعیت پرداخت، پیگیری سفارش،
            آکادمی، تحویل و پشتیبانی.
          </p>
          <div className="btn-row">
            <Link href="/help" className="btn btn-primary">
              راهنما و پشتیبانی
            </Link>
            <Link href="/purchase-terms" className="btn btn-ghost">
              شرایط خرید
            </Link>
          </div>
        </div>

        <div className="faq-list">
          {operationalFaqs.map((item) => (
            <div className="surface nested-card faq-item" key={item.question}>
              <strong>{item.question}</strong>
              <p className="muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
