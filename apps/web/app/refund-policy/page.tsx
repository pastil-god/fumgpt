import type { Metadata } from "next";
import { OperationalContentPage } from "@/components/operational-content-page";
import { refundPolicyContent } from "@/lib/operations-content";
import { buildPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "سیاست بازگشت وجه",
  description: "توضیح روشن شرایط بررسی بازگشت وجه و مرزهای واقعی آن در فروشگاه FumGPT.",
  path: "/refund-policy"
});

export default function RefundPolicyPage() {
  return (
    <OperationalContentPage
      content={refundPolicyContent}
      actions={[
        { href: "/help", label: "درخواست پشتیبانی", tone: "primary" },
        { href: "/purchase-terms", label: "شرایط خرید", tone: "ghost" }
      ]}
    />
  );
}
