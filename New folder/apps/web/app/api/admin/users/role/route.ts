import { NextRequest, NextResponse } from "next/server";
import { APP_ROLES, getSafeRedirectPath } from "@/lib/auth";
import { canManageRoles } from "@/lib/authorization";
import { prisma } from "@/lib/db/prisma";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";
import { getSession } from "@/lib/auth";

function redirectWith(request: NextRequest, redirectTo: string | null, params: Record<string, string>) {
  const url = new URL(getSafeRedirectPath(redirectTo, "/admin/users"), request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/admin/users/role");
  const formData = await request.formData();
  const userId = String(formData.get("userId") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/admin/users");
  const session = await getSession();

  if (!session) {
    return attachRequestContext(
      NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(getSafeRedirectPath(redirectTo, "/admin/users"))}`, request.url), 303),
      requestContext
    );
  }

  if (!canManageRoles(session.role)) {
    return attachRequestContext(
      NextResponse.redirect(redirectWith(request, redirectTo, { error: "role-denied" }), 303),
      requestContext
    );
  }

  if (!userId || !APP_ROLES.includes(role as (typeof APP_ROLES)[number])) {
    return attachRequestContext(
      NextResponse.redirect(redirectWith(request, redirectTo, { error: "invalid-role" }), 303),
      requestContext
    );
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!targetUser) {
    return attachRequestContext(
      NextResponse.redirect(redirectWith(request, redirectTo, { error: "user-not-found" }), 303),
      requestContext
    );
  }

  if (targetUser.id === session.userId && targetUser.role === "super_admin" && role !== "super_admin") {
    return attachRequestContext(
      NextResponse.redirect(redirectWith(request, redirectTo, { error: "cannot-downgrade-self" }), 303),
      requestContext
    );
  }

  if (targetUser.role === "super_admin" && role !== "super_admin") {
    const superAdminCount = await prisma.user.count({ where: { role: "super_admin" } });

    if (superAdminCount <= 1) {
      return attachRequestContext(
        NextResponse.redirect(redirectWith(request, redirectTo, { error: "last-super-admin" }), 303),
        requestContext
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      updatedAt: new Date()
    }
  });

  await recordAuditEvent({
    action: "admin.user_role_updated",
    entityType: "user",
    entityId: updatedUser.id,
    userId: session.userId,
    requestContext,
    details: {
      previousRole: targetUser.role,
      nextRole: role
    },
    message: "Super admin updated user role"
  });

  return attachRequestContext(
    NextResponse.redirect(redirectWith(request, redirectTo, { roleUpdated: "1" }), 303),
    requestContext
  );
}
