import { dbAuditLogs } from "@/lib/db";
import { logServerEvent, type LogLevel } from "@/lib/observability/logger";
import type { RequestContext } from "@/lib/observability/request";

export async function recordAuditEvent(params: {
  action: string;
  entityType: string;
  entityId?: string;
  requestContext?: Pick<RequestContext, "requestId" | "route" | "method" | "ipAddress">;
  userId?: string;
  details?: string | Record<string, unknown>;
  level?: LogLevel;
  message?: string;
}) {
  await dbAuditLogs.create({
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    requestId: params.requestContext?.requestId,
    userId: params.userId,
    details: params.details,
    ipAddress: params.requestContext?.ipAddress
  });

  await logServerEvent({
    level: params.level || "info",
    event: params.action,
    message: params.message || params.action,
    requestId: params.requestContext?.requestId,
    route: params.requestContext?.route,
    method: params.requestContext?.method,
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    data:
      typeof params.details === "string"
        ? {
            details: params.details
          }
        : params.details
  });
}
