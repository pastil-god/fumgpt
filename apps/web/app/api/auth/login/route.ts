import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createMockSession, getSafeRedirectPath } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const redirectTo = getSafeRedirectPath(String(formData.get("redirectTo") || "/account"));

  if (!identifier || !password) {
    return NextResponse.redirect(new URL("/login?error=missing-fields", request.url));
  }

  const { encoded } = createMockSession(identifier);
  const redirectUrl = new URL(redirectTo, request.url);
  redirectUrl.searchParams.set("welcome", "1");
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: encoded,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
