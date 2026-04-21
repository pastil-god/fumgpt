import { getContentSourceInfo } from "@/lib/content";

export async function GET() {
  const contentSource = getContentSourceInfo();

  return Response.json({
    cms: contentSource.cmsMode,
    cmsConfigured: contentSource.cmsConfigured,
    commerce: process.env.NEXT_PUBLIC_ENABLE_REAL_COMMERCE === "true" ? "connected" : "mock",
    paymentProvider: process.env.PAYMENT_PROVIDER || "planned",
    smsProvider: process.env.SMS_PROVIDER || "planned",
    auth: "mock-session"
  });
}
