import { NextRequest, NextResponse } from "next/server";
import { scheduleRequestAnalyticsEvent } from "@/lib/analytics";
import { getSafeRedirectPath } from "@/lib/auth";
import { AuthFlowError, requestOtpSignIn } from "@/lib/auth/otp";
import { recordAuditEvent } from "@/lib/observability/audit";
import { captureServerError } from "@/lib/observability/monitoring";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

function buildRedirectUrl(request: NextRequest, params: Record<string, string | undefined>) {
  const url = new URL("/login", request.url);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/auth/login");
  const formData = await request.formData();
  const identifier = String(formData.get("identifier") || "").trim();
  const channel = String(formData.get("channel") || "email").trim().toLowerCase();
  const redirectTo = getSafeRedirectPath(String(formData.get("redirectTo") || "/account"));

  if (!identifier) {
    scheduleRequestAnalyticsEvent({
      name: "login_failure",
      request,
      requestContext,
      path: "/login",
      metadata: {
        stage: "otp_request",
        reason: "missing-identifier",
        channel
      }
    });

    await recordAuditEvent({
      action: "auth.login_attempt_rejected",
      entityType: "auth",
      requestContext,
      level: "warn",
      details: {
        reason: "missing-identifier",
        channel
      },
      message: "Login attempt rejected because identifier was missing"
    });

    return attachRequestContext(
      NextResponse.redirect(
      buildRedirectUrl(request, {
        error: "missing-identifier",
        next: redirectTo
      }),
      303
      ),
      requestContext
    );
  }

  try {
    await recordAuditEvent({
      action: "auth.login_attempt",
      entityType: "auth",
      entityId: identifier,
      requestContext,
      details: {
        channel
      },
      message: "Login attempt started"
    });

    const result = await requestOtpSignIn({
      identifier,
      channel,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      requestContext
    });

    return attachRequestContext(
      NextResponse.redirect(
      buildRedirectUrl(request, {
        step: "verify",
        identifier: result.identifier,
        channel: result.channel,
        sent: "1",
        next: redirectTo,
        devCode: result.delivery.devCode
      }),
      303
      ),
      requestContext
    );
  } catch (error) {
    const errorCode =
      error instanceof AuthFlowError
        ? error.code
        : error instanceof Error && (error.message === "invalid-email" || error.message === "invalid-phone")
          ? error.message
          : "otp-request-failed";

    const meta = error instanceof AuthFlowError ? error.meta : undefined;

    scheduleRequestAnalyticsEvent({
      name: "login_failure",
      request,
      requestContext,
      path: "/login",
      metadata: {
        stage: "otp_request",
        reason: errorCode,
        channel: typeof meta?.channel === "string" ? meta.channel : channel
      }
    });

    await recordAuditEvent({
      action: "auth.login_attempt_failed",
      entityType: "auth",
      entityId: typeof meta?.identifier === "string" ? meta.identifier : identifier,
      requestContext,
      level: "warn",
      details: {
        channel: typeof meta?.channel === "string" ? meta.channel : channel,
        error: errorCode
      },
      message: "Login attempt failed before OTP verification"
    });

    if (!(error instanceof AuthFlowError)) {
      await captureServerError({
        event: "auth.login_attempt_failed",
        message: "Unexpected error during login attempt",
        requestId: requestContext.requestId,
        route: requestContext.route,
        data: {
          identifier,
          channel
        },
        error
      });
    }

    return attachRequestContext(
      NextResponse.redirect(
      buildRedirectUrl(request, {
        step: meta?.identifier ? "verify" : undefined,
        identifier: typeof meta?.identifier === "string" ? meta.identifier : undefined,
        channel: typeof meta?.channel === "string" ? meta.channel : channel,
        error: errorCode,
        cooldown: typeof meta?.cooldownSeconds === "number" ? String(meta.cooldownSeconds) : undefined,
        next: redirectTo
      }),
      303
      ),
      requestContext
    );
  }
}
