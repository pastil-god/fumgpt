import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { dbSessions } from "@/lib/db";

export const AUTH_COOKIE_NAME = "fumgpt_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthChannel = "email" | "sms";
export const APP_ROLES = [
  "customer",
  "super_admin",
  "content_manager",
  "order_operator",
  "support_operator",
  "editor"
] as const;

export type AppRole = (typeof APP_ROLES)[number];

function normalizeAppRole(value: string | null | undefined): AppRole {
  return APP_ROLES.includes(value as AppRole) ? (value as AppRole) : "customer";
}

export type AppSession = {
  sessionId: string;
  userId: string;
  identifier: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  role: AppRole;
  authMode: string;
  createdAt: string;
  expiresAt: string;
};

export function getSafeRedirectPath(value: string | null, fallback = "/account") {
  const normalizedValue = value?.trim();

  if (!normalizedValue || !normalizedValue.startsWith("/") || normalizedValue.startsWith("//")) {
    return fallback;
  }

  return normalizedValue;
}

export function buildDisplayName(identifier: string) {
  const normalized = identifier.trim();

  if (normalized.includes("@")) {
    return normalized.split("@")[0];
  }

  return normalized;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmailIdentifier(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function normalizePhone(value: string) {
  const digits = value.trim().replace(/[^\d+]/g, "");

  if (digits.startsWith("+98")) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith("98")) {
    return `0${digits.slice(2)}`;
  }

  return digits;
}

export function isPhoneIdentifier(value: string) {
  return /^09\d{9}$/.test(normalizePhone(value));
}

export function normalizeAuthTarget(identifier: string, preferredChannel?: string | null) {
  const channel = (preferredChannel || "").trim().toLowerCase();

  if (channel === "sms") {
    if (!isPhoneIdentifier(identifier)) {
      throw new Error("invalid-phone");
    }

    return {
      identifier: normalizePhone(identifier),
      channel: "sms" as const
    };
  }

  if (!isEmailIdentifier(identifier)) {
    throw new Error("invalid-email");
  }

  return {
    identifier: normalizeEmail(identifier),
    channel: "email" as const
  };
}

export function getAuthIdentityProvider(channel: AuthChannel) {
  return channel === "sms" ? "phone_otp" : "email_otp";
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function createSessionExpiryDate() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE_NAME);
}

export async function revokeSessionToken(token: string) {
  if (!token) {
    return;
  }

  await dbSessions.revokeByToken(token);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await dbSessions.findActiveByToken(token);

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const primaryIdentity = user.authIdentities[0];
  const identifier = user.email || user.phone || primaryIdentity?.identifier || user.id;

  return {
    sessionId: session.id,
    userId: user.id,
    identifier,
    email: user.email || null,
    phone: user.phone || null,
    displayName: user.profile?.displayName || buildDisplayName(identifier),
    role: normalizeAppRole(user.role),
    authMode: session.authMode,
    createdAt: user.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString()
  } satisfies AppSession;
}

export function getRequestClientInfo(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwarded = forwardedFor?.split(",")[0]?.trim();

  return {
    ipAddress: firstForwarded || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined
  };
}
