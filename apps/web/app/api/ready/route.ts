import { getReadinessSnapshot } from "@/lib/observability/health";
import { logServerEvent } from "@/lib/observability/logger";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

export async function GET(request: Request) {
  const requestContext = createRequestContext(request, "/api/ready");
  const readiness = await getReadinessSnapshot();
  const response = attachRequestContext(
    Response.json(
      {
        status: readiness.status,
        ready: readiness.ready,
        requestId: requestContext.requestId,
        ...readiness.snapshot
      },
      {
        status: readiness.ready ? 200 : 503
      }
    ),
    requestContext
  );

  if (!readiness.ready) {
    await logServerEvent({
      level: "warn",
      event: "health.readiness_failed",
      message: "Readiness check failed",
      requestId: requestContext.requestId,
      route: requestContext.route,
      method: requestContext.method,
      data: {
        databaseMode: readiness.snapshot.database.mode,
        authReady: readiness.snapshot.auth.ready
      }
    });
  }

  return response;
}
