import { getOperationalHealthSnapshot } from "@/lib/observability/health";
import { logServerEvent } from "@/lib/observability/logger";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

export async function GET(request: Request) {
  const requestContext = createRequestContext(request, "/api/health");
  const snapshot = await getOperationalHealthSnapshot();
  const response = attachRequestContext(
    Response.json({
      status: "ok",
      requestId: requestContext.requestId,
      app: snapshot.app,
      phase: 1,
      timestamp: snapshot.timestamp,
      nodeEnv: snapshot.nodeEnv,
      cmsMode: snapshot.cms.mode,
      authMode: snapshot.auth.mode,
      database: snapshot.database,
      logging: snapshot.logging,
      monitoring: snapshot.monitoring
    }),
    requestContext
  );

  if (!snapshot.database.connected) {
    await logServerEvent({
      level: "warn",
      event: "health.degraded",
      message: "Health check returned a degraded database status",
      requestId: requestContext.requestId,
      route: requestContext.route,
      method: requestContext.method,
      data: {
        databaseMode: snapshot.database.mode
      }
    });
  }

  return response;
}
