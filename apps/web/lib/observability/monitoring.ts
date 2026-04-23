import { logServerEvent } from "@/lib/observability/logger";

export type MonitoringPayload = {
  event: string;
  message: string;
  requestId?: string;
  route?: string;
  userId?: string;
  data?: Record<string, unknown>;
  error?: unknown;
};

export type MonitoringAdapter = {
  name: string;
  enabled: boolean;
  captureError: (payload: MonitoringPayload) => Promise<void>;
  captureMessage: (payload: MonitoringPayload) => Promise<void>;
};

const disabledAdapter: MonitoringAdapter = {
  name: "disabled",
  enabled: false,
  async captureError() {},
  async captureMessage() {}
};

const consoleAdapter: MonitoringAdapter = {
  name: "console",
  enabled: true,
  async captureError(payload) {
    await logServerEvent({
      level: "error",
      event: `monitoring.${payload.event}`,
      message: payload.message,
      requestId: payload.requestId,
      route: payload.route,
      userId: payload.userId,
      data: payload.data,
      error: payload.error
    });
  },
  async captureMessage(payload) {
    await logServerEvent({
      level: "info",
      event: `monitoring.${payload.event}`,
      message: payload.message,
      requestId: payload.requestId,
      route: payload.route,
      userId: payload.userId,
      data: payload.data
    });
  }
};

function getConfiguredMonitoringAdapter() {
  const adapterName = (process.env.MONITORING_ADAPTER || "disabled").trim().toLowerCase();

  if (adapterName === "console") {
    return consoleAdapter;
  }

  return disabledAdapter;
}

export function getMonitoringStatus() {
  const adapter = getConfiguredMonitoringAdapter();

  return {
    adapter: adapter.name,
    enabled: adapter.enabled
  };
}

export async function captureServerError(payload: MonitoringPayload) {
  await logServerEvent({
    level: "error",
    event: payload.event,
    message: payload.message,
    requestId: payload.requestId,
    route: payload.route,
    userId: payload.userId,
    data: payload.data,
    error: payload.error
  });

  const adapter = getConfiguredMonitoringAdapter();

  if (adapter.enabled) {
    await adapter.captureError(payload);
  }
}

export async function captureMonitoringMessage(payload: MonitoringPayload) {
  const adapter = getConfiguredMonitoringAdapter();

  if (adapter.enabled) {
    await adapter.captureMessage(payload);
  }
}
