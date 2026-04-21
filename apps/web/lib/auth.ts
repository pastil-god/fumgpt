import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "fumgpt_session";

export type MockSession = {
  identifier: string;
  displayName: string;
  role: "customer";
  authMode: "mock";
  createdAt: string;
};

function encodeSession(session: MockSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string): MockSession | null {
  try {
    const raw = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as MockSession;

    if (!parsed.identifier || !parsed.displayName || !parsed.createdAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function buildDisplayName(identifier: string) {
  const normalized = identifier.trim();

  if (normalized.includes("@")) {
    return normalized.split("@")[0];
  }

  return normalized;
}

export function createMockSession(identifier: string) {
  const session: MockSession = {
    identifier: identifier.trim(),
    displayName: buildDisplayName(identifier),
    role: "customer",
    authMode: "mock",
    createdAt: new Date().toISOString()
  };

  return {
    session,
    encoded: encodeSession(session)
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return decodeSession(value);
}

export function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/account";
  }

  return value;
}
