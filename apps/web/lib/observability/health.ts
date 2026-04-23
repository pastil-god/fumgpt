import { getAuthTransportInfo } from "@/lib/auth/transports";
import { getContentSourceInfo } from "@/lib/content";
import { getDatabaseHealth } from "@/lib/db";
import { getLoggingStatus } from "@/lib/observability/logger";
import { getMonitoringStatus } from "@/lib/observability/monitoring";
import { getPaymentProviderPresentation } from "@/lib/payment";

function getEmailAuthReadiness() {
  const transportInfo = getAuthTransportInfo();
  const emailTransport = transportInfo.email;

  if (emailTransport !== "smtp") {
    return {
      transport: emailTransport,
      ready: true,
      reason: "local-or-mock-transport"
    };
  }

  const ready = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  return {
    transport: emailTransport,
    ready,
    reason: ready ? "smtp-configured" : "smtp-missing-config"
  };
}

export async function getOperationalHealthSnapshot() {
  const contentSource = getContentSourceInfo();
  const database = await getDatabaseHealth();
  const paymentProvider = getPaymentProviderPresentation();
  const logging = getLoggingStatus();
  const monitoring = getMonitoringStatus();
  const authEmail = getEmailAuthReadiness();

  return {
    app: "fumgpt-storefront",
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || "development",
    cms: {
      mode: contentSource.cmsMode,
      configured: contentSource.cmsConfigured,
      ready: true
    },
    database,
    auth: {
      mode: "email-otp-session",
      email: authEmail,
      ready: authEmail.ready
    },
    checkout: {
      provider: paymentProvider.key,
      title: paymentProvider.title,
      ready: true
    },
    logging,
    monitoring
  };
}

export async function getReadinessSnapshot() {
  const snapshot = await getOperationalHealthSnapshot();
  const ready = snapshot.database.configured && snapshot.database.connected && snapshot.auth.ready;

  return {
    status: ready ? "ready" : "not_ready",
    ready,
    snapshot
  };
}
