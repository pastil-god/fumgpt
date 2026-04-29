import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getRequestClientInfo } from "@/lib/auth";

export type RequestContext = {
  requestId: string;
  route: string;
  method: string;
  startedAt: number;
  ipAddress?: string;
  userAgent?: string;
};

function normalizeRequestId(value: string | null) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return randomUUID();
  }

  return normalizedValue.slice(0, 120);
}

export function createRequestContext(request: Request | NextRequest, route: string): RequestContext {
  const { ipAddress, userAgent } = getRequestClientInfo(request);

  return {
    requestId: normalizeRequestId(request.headers.get("x-request-id")),
    route,
    method: request.method,
    startedAt: Date.now(),
    ipAddress,
    userAgent
  };
}

export function getRequestDurationMs(context: RequestContext) {
  return Date.now() - context.startedAt;
}

export function attachRequestContext<T extends Response | NextResponse>(response: T, context: RequestContext) {
  response.headers.set("x-request-id", context.requestId);
  return response;
}
