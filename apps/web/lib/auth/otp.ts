import { timingSafeEqual } from "node:crypto";
import {
  dbAuditLogs,
  dbAuthIdentities,
  dbOtpCodes,
  dbSessions,
  dbUsers,
  hashSecret
} from "@/lib/db";
import {
  buildDisplayName,
  createSessionToken,
  createSessionExpiryDate,
  getAuthIdentityProvider,
  normalizeAuthTarget
} from "@/lib/auth";
import { sendOtp, type OtpDeliveryResult } from "@/lib/auth/transports";
import { recordAuditEvent } from "@/lib/observability/audit";
import { captureServerError } from "@/lib/observability/monitoring";
import type { RequestContext } from "@/lib/observability/request";

const OTP_EXPIRY_MINUTES = {
  email: 10,
  sms: 5
} as const;

const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_IDENTIFIER_WINDOW_MINUTES = 15;
const OTP_IDENTIFIER_WINDOW_LIMIT = 5;
const OTP_IP_WINDOW_MINUTES = 15;
const OTP_IP_WINDOW_LIMIT = 20;
const OTP_PURPOSE = "sign_in";

export class AuthFlowError extends Error {
  code: string;
  meta?: Record<string, string | number | boolean | undefined>;

  constructor(code: string, meta?: Record<string, string | number | boolean | undefined>) {
    super(code);
    this.code = code;
    this.meta = meta;
  }
}

function compareOtpCode(input: string, hashedCode: string) {
  const inputHash = hashSecret(input);

  if (inputHash.length !== hashedCode.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(inputHash), Buffer.from(hashedCode));
}

function buildOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtpSignIn(params: {
  identifier: string;
  channel?: string | null;
  ipAddress?: string;
  userAgent?: string;
  requestContext?: Pick<RequestContext, "requestId" | "route" | "method" | "ipAddress">;
}) {
  const target = normalizeAuthTarget(params.identifier, params.channel);
  const now = new Date();
  const latestOtp = await dbOtpCodes.findLatestPending({
    identifier: target.identifier,
    purpose: OTP_PURPOSE,
    channel: target.channel
  });

  if (latestOtp) {
    const cooldownEndsAt = latestOtp.createdAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
    if (cooldownEndsAt > now.getTime()) {
      const cooldownSeconds = Math.ceil((cooldownEndsAt - now.getTime()) / 1000);
      throw new AuthFlowError("otp-cooldown", {
        channel: target.channel,
        identifier: target.identifier,
        cooldownSeconds
      });
    }
  }

  const recentByIdentifier = await dbOtpCodes.countRecent({
    identifier: target.identifier,
    purpose: OTP_PURPOSE,
    channel: target.channel,
    since: new Date(now.getTime() - OTP_IDENTIFIER_WINDOW_MINUTES * 60 * 1000)
  });

  if (recentByIdentifier >= OTP_IDENTIFIER_WINDOW_LIMIT) {
    throw new AuthFlowError("otp-rate-limited", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  if (params.ipAddress) {
    const recentByIp = await dbAuditLogs.countRecentByActionAndIp({
      action: "auth.otp.request",
      ipAddress: params.ipAddress,
      since: new Date(now.getTime() - OTP_IP_WINDOW_MINUTES * 60 * 1000)
    });

    if (recentByIp >= OTP_IP_WINDOW_LIMIT) {
      throw new AuthFlowError("otp-rate-limited", {
        channel: target.channel,
        identifier: target.identifier
      });
    }
  }

  await dbOtpCodes.invalidateActive({
    identifier: target.identifier,
    purpose: OTP_PURPOSE,
    channel: target.channel
  });

  const user = await dbUsers.findByIdentifier(target.identifier);
  const code = buildOtpCode();
  const expiresInMinutes = OTP_EXPIRY_MINUTES[target.channel];
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  await dbOtpCodes.create({
    identifier: target.identifier,
    code,
    purpose: OTP_PURPOSE,
    channel: target.channel,
    expiresAt,
    userId: user?.id
  });

  await recordAuditEvent({
    action: "auth.otp.request",
    entityType: "auth",
    entityId: target.identifier,
    userId: user?.id,
    requestContext: params.requestContext,
    details: {
      channel: target.channel,
      phase: "request"
    },
    message: "OTP request accepted"
  });

  let delivery: OtpDeliveryResult;

  try {
    delivery = await sendOtp({
      channel: target.channel,
      identifier: target.identifier,
      code,
      expiresInMinutes,
      requestId: params.requestContext?.requestId
    });
  } catch (error) {
    await recordAuditEvent({
      action: "auth.otp.delivery_failed",
      entityType: "auth",
      entityId: target.identifier,
      userId: user?.id,
      requestContext: params.requestContext,
      level: "error",
      details: {
        channel: target.channel,
        reason: error instanceof Error ? error.message : "otp-delivery-failed"
      },
      message: "OTP delivery failed"
    });
    await captureServerError({
      event: "auth.otp.delivery_failed",
      message: "Failed to deliver OTP",
      requestId: params.requestContext?.requestId,
      route: params.requestContext?.route,
      userId: user?.id,
      data: {
        channel: target.channel,
        identifier: target.identifier
      },
      error
    });

    throw new AuthFlowError("otp-delivery-failed", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  await recordAuditEvent({
    action: "auth.otp.sent",
    entityType: "auth",
    entityId: target.identifier,
    userId: user?.id,
    requestContext: params.requestContext,
    details: {
      channel: target.channel,
      transport: delivery.transport
    },
    message: "OTP sent"
  });

  return {
    identifier: target.identifier,
    channel: target.channel,
    expiresInMinutes,
    delivery
  };
}

export async function verifyOtpSignIn(params: {
  identifier: string;
  code: string;
  channel?: string | null;
  ipAddress?: string;
  userAgent?: string;
  requestContext?: Pick<RequestContext, "requestId" | "route" | "method" | "ipAddress">;
}) {
  const target = normalizeAuthTarget(params.identifier, params.channel);
  const normalizedCode = params.code.trim();

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new AuthFlowError("otp-invalid", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  const otp = await dbOtpCodes.findLatestPending({
    identifier: target.identifier,
    purpose: OTP_PURPOSE,
    channel: target.channel
  });

  if (!otp) {
    throw new AuthFlowError("otp-invalid", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  if (otp.expiresAt.getTime() <= Date.now()) {
    throw new AuthFlowError("otp-expired", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AuthFlowError("otp-max-attempts", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  if (!compareOtpCode(normalizedCode, otp.codeHash)) {
    const updatedOtp = await dbOtpCodes.incrementAttempts(otp.id);

    await recordAuditEvent({
      action: "auth.otp.invalid",
      entityType: "auth",
      entityId: target.identifier,
      userId: otp.userId || undefined,
      requestContext: params.requestContext,
      level: "warn",
      details: {
        channel: target.channel,
        attempts: updatedOtp.attempts
      },
      message: "Invalid OTP submitted"
    });

    if (updatedOtp.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AuthFlowError("otp-max-attempts", {
        channel: target.channel,
        identifier: target.identifier
      });
    }

    throw new AuthFlowError("otp-invalid", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  await dbOtpCodes.consume(otp.id);

  const existingUser = await dbUsers.findByIdentifier(target.identifier);
  let user = existingUser;

  if (!user) {
    const createdUser = await dbUsers.create({
      email: target.channel === "email" ? target.identifier : undefined,
      phone: target.channel === "sms" ? target.identifier : undefined,
      displayName: buildDisplayName(target.identifier)
    });

    user = await dbUsers.findById(createdUser.id);
  }

  if (!user) {
    throw new AuthFlowError("account-create-failed", {
      channel: target.channel,
      identifier: target.identifier
    });
  }

  await dbAuthIdentities.upsertOtpIdentity({
    userId: user.id,
    identifier: target.identifier,
    provider: getAuthIdentityProvider(target.channel)
  });

  const sessionToken = createSessionToken();
  const expiresAt = createSessionExpiryDate();

  const session = await dbSessions.create({
    userId: user.id,
    token: sessionToken,
    expiresAt,
    authMode: getAuthIdentityProvider(target.channel),
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });

  await recordAuditEvent({
    action: existingUser ? "auth.sign_in" : "auth.sign_up",
    entityType: "auth",
    entityId: user.id,
    userId: user.id,
    requestContext: params.requestContext,
    details: {
      channel: target.channel,
      mode: existingUser ? "sign_in" : "sign_up"
    },
    message: existingUser ? "User signed in with OTP" : "User account created with OTP"
  });

  return {
    user,
    sessionToken,
    session,
    expiresAt,
    channel: target.channel
  };
}
