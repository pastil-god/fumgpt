import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { dbAnalyticsEvents } from "@/lib/db";
import { logServerEvent } from "@/lib/observability/logger";
import type { RequestContext } from "@/lib/observability/request";

export const TRACKED_ANALYTICS_EVENTS = {
  homepage_view: {
    description: "Homepage was rendered for a storefront visit."
  },
  product_page_view: {
    description: "A product detail page was viewed."
  },
  add_to_cart: {
    description: "A product was added to the cart."
  },
  begin_checkout: {
    description: "Checkout page was opened with a non-empty cart."
  },
  order_created: {
    description: "An order was successfully created from checkout."
  },
  login_success: {
    description: "A user successfully completed login and received a session."
  },
  login_failure: {
    description: "A login flow failed before a session was created."
  },
  academy_article_view: {
    description:
      "An academy-related editorial article was viewed. Until a dedicated academy article route exists, this maps to academy-related /news/[slug] pages."
  }
} as const;

export type AnalyticsEventName = keyof typeof TRACKED_ANALYTICS_EVENTS;

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return value in TRACKED_ANALYTICS_EVENTS;
}

type AnalyticsEventRecord = {
  name: AnalyticsEventName;
  route: string;
  path: string;
  requestId?: string;
  userId?: string;
  sessionKind?: "guest" | "authenticated";
  referrerHost?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

type AnalyticsAdapter = {
  key: string;
  track: (event: AnalyticsEventRecord) => Promise<void>;
};

function normalizeRequestId(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return randomUUID();
  }

  return normalizedValue.slice(0, 120);
}

function getReferrerHost(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).host || undefined;
  } catch {
    return undefined;
  }
}

function isSensitiveMetadataKey(key: string) {
  return [
    "email",
    "phone",
    "fullName",
    "name",
    "address",
    "postal",
    "identifier",
    "token",
    "code",
    "notes",
    "message",
    "body"
  ].some((pattern) => key.toLowerCase().includes(pattern));
}

function sanitizeAnalyticsMetadata(value: unknown, depth = 0): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    return value.length > 280 ? `${value.slice(0, 277)}...` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return depth >= 2 ? `[array:${value.length}]` : value.slice(0, 20).map((item) => sanitizeAnalyticsMetadata(item, depth + 1));
  }

  if (typeof value === "object") {
    if (depth >= 2) {
      return "[object]";
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !isSensitiveMetadataKey(key))
        .slice(0, 24)
        .map(([key, entryValue]) => [key, sanitizeAnalyticsMetadata(entryValue, depth + 1)])
    );
  }

  return String(value);
}

function getExternalAnalyticsAdapters(): AnalyticsAdapter[] {
  const adapterKey = (process.env.ANALYTICS_ADAPTER || "disabled").trim().toLowerCase();

  switch (adapterKey) {
    case "disabled":
    default:
      return [];
  }
}

export async function trackAnalyticsEvent(input: AnalyticsEventRecord) {
  const metadata = input.metadata
    ? (sanitizeAnalyticsMetadata(input.metadata) as Record<string, unknown>)
    : undefined;

  try {
    await dbAnalyticsEvents.create({
      name: input.name,
      route: input.route,
      path: input.path,
      requestId: input.requestId,
      userId: input.userId,
      sessionKind: input.sessionKind || (input.userId ? "authenticated" : "guest"),
      referrerHost: input.referrerHost,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata
    });

    await logServerEvent({
      event: `analytics.${input.name}`,
      message: `Analytics event recorded: ${input.name}`,
      requestId: input.requestId,
      route: input.route,
      userId: input.userId,
      entityType: input.entityType,
      entityId: input.entityId,
      data: {
        path: input.path,
        sessionKind: input.sessionKind || (input.userId ? "authenticated" : "guest"),
        referrerHost: input.referrerHost,
        metadata
      }
    });

    const adapters = getExternalAnalyticsAdapters();

    for (const adapter of adapters) {
      await adapter.track({
        ...input,
        metadata
      });
    }
  } catch (error) {
    await logServerEvent({
      level: "warn",
      event: "analytics.track_failed",
      message: "Analytics event could not be recorded",
      requestId: input.requestId,
      route: input.route,
      userId: input.userId,
      entityType: input.entityType,
      entityId: input.entityId,
      data: {
        name: input.name,
        path: input.path
      },
      error
    });
  }
}

export function scheduleRequestAnalyticsEvent(params: {
  name: AnalyticsEventName;
  request: Request;
  requestContext?: Pick<RequestContext, "requestId" | "route">;
  path?: string;
  userId?: string;
  sessionKind?: "guest" | "authenticated";
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const requestId = params.requestContext?.requestId || normalizeRequestId(params.request.headers.get("x-request-id"));
  const route = params.requestContext?.route || new URL(params.request.url).pathname;
  const path = params.path || new URL(params.request.url).pathname;
  const referrerHost = getReferrerHost(params.request.headers.get("referer"));

  after(async () => {
    await trackAnalyticsEvent({
      name: params.name,
      requestId,
      route,
      path,
      referrerHost,
      userId: params.userId,
      sessionKind: params.sessionKind,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata
    });
  });
}

export function isAcademyEditorialArticle(params: {
  slug?: string;
  title?: string;
  excerpt?: string;
}) {
  const haystack = [params.slug, params.title, params.excerpt].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes("academy") || haystack.includes("آکادمی") || haystack.includes("آموزش");
}

export function getAnalyticsStatus() {
  const adapters = getExternalAnalyticsAdapters();

  return {
    internalStorage: "database",
    externalAdapter: (process.env.ANALYTICS_ADAPTER || "disabled").trim().toLowerCase() || "disabled",
    fanoutEnabled: adapters.length > 0,
    trackedEvents: Object.keys(TRACKED_ANALYTICS_EVENTS)
  };
}
