import { NextRequest, NextResponse } from "next/server";
import { isAnalyticsEventName, trackAnalyticsEvent } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

const CLIENT_TRACKABLE_EVENTS = new Set<string>([
  "homepage_view",
  "product_page_view",
  "begin_checkout",
  "academy_article_view"
]);

function getReferrerHost(value: string | null) {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).host || undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/analytics");
  const session = await getSession();

  try {
    const payload = (await request.json()) as {
      name?: string;
      route?: string;
      path?: string;
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    };

    if (
      !payload?.name ||
      !isAnalyticsEventName(payload.name) ||
      !CLIENT_TRACKABLE_EVENTS.has(payload.name) ||
      !payload.route ||
      !payload.path
    ) {
      return attachRequestContext(
        NextResponse.json(
          {
            ok: false,
            error: "invalid-analytics-payload"
          },
          {
            status: 400
          }
        ),
        requestContext
      );
    }

    await trackAnalyticsEvent({
      name: payload.name,
      route: payload.route,
      path: payload.path,
      requestId: requestContext.requestId,
      userId: session?.userId,
      sessionKind: session ? "authenticated" : "guest",
      referrerHost: getReferrerHost(request.headers.get("referer")),
      entityType: payload.entityType,
      entityId: payload.entityId,
      metadata: payload.metadata
    });

    return attachRequestContext(
      NextResponse.json({
        ok: true
      }),
      requestContext
    );
  } catch {
    return attachRequestContext(
      NextResponse.json(
        {
          ok: false,
          error: "invalid-analytics-payload"
        },
        {
          status: 400
        }
      ),
      requestContext
    );
  }
}
