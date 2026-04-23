import { NextRequest, NextResponse } from "next/server";
import { scheduleRequestAnalyticsEvent } from "@/lib/analytics";
import {
  getSafeRedirectPath,
  setSessionCookie
} from "@/lib/auth";
import { AuthFlowError, verifyOtpSignIn } from "@/lib/auth/otp";
import {
  clearGuestCartCookie,
  getGuestCartIdFromRequest,
  mergeGuestCartIntoUserCart
} from "@/lib/cart";
import { recordAuditEvent } from "@/lib/observability/audit";
import { captureServerError } from "@/lib/observability/monitoring";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

function buildLoginRedirectUrl(request: NextRequest, params: Record<string, string | undefined>) {
  const url = new URL("/login", request.url);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/auth/verify-otp");
  const formData = await request.formData();
  const identifier = String(formData.get("identifier") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const channel = String(formData.get("channel") || "email").trim().toLowerCase();
  const redirectTo = getSafeRedirectPath(String(formData.get("redirectTo") || "/account"));
  const guestCartId = getGuestCartIdFromRequest(request);

  if (!identifier || !code) {
    scheduleRequestAnalyticsEvent({
      name: "login_failure",
      request,
      requestContext,
      path: "/login",
      metadata: {
        stage: "otp_verify",
        reason: "missing-code",
        channel
      }
    });

    await recordAuditEvent({
      action: "auth.login_verify_rejected",
      entityType: "auth",
      entityId: identifier || undefined,
      requestContext,
      level: "warn",
      details: {
        reason: "missing-code",
        channel
      },
      message: "OTP verification attempt was rejected"
    });

    return attachRequestContext(
      NextResponse.redirect(
      buildLoginRedirectUrl(request, {
        step: "verify",
        identifier,
        channel,
        error: "missing-code",
        next: redirectTo
      }),
      303
      ),
      requestContext
    );
  }

  try {
    await recordAuditEvent({
      action: "auth.login_verify_attempt",
      entityType: "auth",
      entityId: identifier,
      requestContext,
      details: {
        channel
      },
      message: "OTP verification attempt started"
    });

    const result = await verifyOtpSignIn({
      identifier,
      code,
      channel,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      requestContext
    });

    let guestCartMerged = false;
    let guestCartMergeFailed = false;

    if (guestCartId) {
      try {
        const mergedCartId = await mergeGuestCartIntoUserCart({
          guestCartId,
          userId: result.user.id
        });

        guestCartMerged = Boolean(mergedCartId);
      } catch {
        guestCartMergeFailed = true;
      }
    }

    const redirectUrl = new URL(redirectTo, request.url);
    redirectUrl.searchParams.set("welcome", "1");

    if (guestCartMerged) {
      redirectUrl.searchParams.set("cart", "merged");
    }

    if (guestCartMergeFailed) {
      redirectUrl.searchParams.set("cartError", "merge-failed");
    }

    const response = attachRequestContext(NextResponse.redirect(redirectUrl, 303), requestContext);
    setSessionCookie(response, result.sessionToken);

    scheduleRequestAnalyticsEvent({
      name: "login_success",
      request,
      requestContext,
      path: redirectTo,
      userId: result.user.id,
      sessionKind: "authenticated",
      entityType: "auth",
      entityId: result.user.id,
      metadata: {
        channel,
        guestCartMerged,
        guestCartMergeFailed
      }
    });

    if (guestCartId && !guestCartMergeFailed) {
      clearGuestCartCookie(response);
    }

    return response;
  } catch (error) {
    const errorCode =
      error instanceof AuthFlowError
        ? error.code
        : error instanceof Error && (error.message === "invalid-email" || error.message === "invalid-phone")
          ? error.message
          : "otp-verify-failed";

    const meta = error instanceof AuthFlowError ? error.meta : undefined;

    scheduleRequestAnalyticsEvent({
      name: "login_failure",
      request,
      requestContext,
      path: "/login",
      metadata: {
        stage: "otp_verify",
        reason: errorCode,
        channel: typeof meta?.channel === "string" ? meta.channel : channel
      }
    });

    await recordAuditEvent({
      action: "auth.login_verify_failed",
      entityType: "auth",
      entityId: typeof meta?.identifier === "string" ? meta.identifier : identifier,
      requestContext,
      level: "warn",
      details: {
        channel: typeof meta?.channel === "string" ? meta.channel : channel,
        error: errorCode
      },
      message: "OTP verification failed"
    });

    if (!(error instanceof AuthFlowError)) {
      await captureServerError({
        event: "auth.login_verify_failed",
        message: "Unexpected error during OTP verification",
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
      buildLoginRedirectUrl(request, {
        step: "verify",
        identifier: typeof meta?.identifier === "string" ? meta.identifier : identifier,
        channel: typeof meta?.channel === "string" ? meta.channel : channel,
        error: errorCode,
        next: redirectTo
      }),
      303
      ),
      requestContext
    );
  }
}
