import { getAnalyticsStatus } from "@/lib/analytics";
import { getAuthTransportInfo } from "@/lib/auth/transports";
import { getContentSourceInfo } from "@/lib/content";
import { getDatabaseHealth } from "@/lib/db";
import { getLoggingStatus } from "@/lib/observability/logger";
import { getMonitoringStatus } from "@/lib/observability/monitoring";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

export async function GET(request: Request) {
  const requestContext = createRequestContext(request, "/api/integrations");
  const contentSource = getContentSourceInfo();
  const database = await getDatabaseHealth();
  const authTransport = getAuthTransportInfo();
  const logging = getLoggingStatus();
  const monitoring = getMonitoringStatus();
  const analytics = getAnalyticsStatus();

  return attachRequestContext(
    Response.json({
      requestId: requestContext.requestId,
      cms: contentSource.cmsMode,
      cmsConfigured: contentSource.cmsConfigured,
      commerce: process.env.NEXT_PUBLIC_ENABLE_REAL_COMMERCE === "true" ? "connected" : "mock",
      payment: {
        configured: Boolean(process.env.CHECKOUT_PAYMENT_PROVIDER),
        mode: process.env.CHECKOUT_PAYMENT_PROVIDER ? "configured" : "not-configured"
      },
      sms: {
        configured: Boolean(process.env.AUTH_SMS_TRANSPORT && process.env.AUTH_SMS_TRANSPORT !== "mock"),
        mode:
          process.env.AUTH_SMS_TRANSPORT && process.env.AUTH_SMS_TRANSPORT !== "mock"
            ? "configured"
            : "mock-or-disabled"
      },
      auth: "email-otp-primary",
      authTransport,
      database,
      logging,
      monitoring,
      analytics
    }),
    requestContext
  );
}
