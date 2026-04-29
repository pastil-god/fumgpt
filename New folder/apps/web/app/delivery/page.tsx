import type { Metadata } from "next";
import { OperationalContentPage } from "@/components/operational-content-page";
import { deliveryContent } from "@/lib/operations-content";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "تحویل و پیگیری سفارش",
  description: "انتظار واقع‌بینانه از تحویل سفارش، پیگیری وضعیت و توضیح روشن درباره سفارش‌های دیجیتال و خدماتی.",
  path: "/delivery"
});

export default function DeliveryPage() {
  return (
    <OperationalContentPage
      content={deliveryContent}
      actions={[
        { href: "/help", label: "راهنما و پشتیبانی", tone: "primary" },
        { href: "/account/orders", label: "پیگیری سفارش‌های من", tone: "secondary" },
        { href: "/faq", label: "پرسش‌های متداول", tone: "ghost" }
      ]}
    />
  );
}
