import type { Metadata } from "next";
import { OperationalContentPage } from "@/components/operational-content-page";
import { purchaseTermsContent } from "@/lib/operations-content";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "شرایط خرید",
  description: "شرایط روشن خرید، تعهدات فعلی فروشگاه و مرزهای عملیاتی سفارش در FumGPT.",
  path: "/purchase-terms"
});

export default function PurchaseTermsPage() {
  return (
    <OperationalContentPage
      content={purchaseTermsContent}
      actions={[
        { href: "/delivery", label: "تحویل و پیگیری سفارش", tone: "primary" },
        { href: "/refund-policy", label: "سیاست بازگشت وجه", tone: "ghost" }
      ]}
    />
  );
}
