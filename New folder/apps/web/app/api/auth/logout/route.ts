import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearSessionCookie, revokeSessionToken } from "@/lib/auth";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/auth/logout");
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await revokeSessionToken(token);
  }

  await recordAuditEvent({
    action: "auth.logout",
    entityType: "auth",
    requestContext,
    message: "Session logout completed"
  });

  const response = attachRequestContext(
    NextResponse.redirect(new URL("/login?loggedOut=1", request.url), 303),
    requestContext
  );
  clearSessionCookie(response);
  return response;
}
