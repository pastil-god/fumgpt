import { NextRequest, NextResponse } from "next/server";
import { getSafeRedirectPath, getSession } from "@/lib/auth";
import { canUpdateOrderStatus } from "@/lib/authorization";
import { dbOrders } from "@/lib/db";
import { getAllowedOrderStatusUpdates, isOrderStatus } from "@/lib/checkout";
import { recordAuditEvent } from "@/lib/observability/audit";
import { captureServerError } from "@/lib/observability/monitoring";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

function buildRedirectUrl(request: NextRequest, redirectTo: string | null, params?: Record<string, string | undefined>) {
  const url = new URL(getSafeRedirectPath(redirectTo, "/admin/orders"), request.url);

  for (const [key, value] of Object.entries(params || {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/admin/orders/status");
  const formData = await request.formData();
  const orderNumber = String(formData.get("orderNumber") || "").trim();
  const nextStatus = String(formData.get("status") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || `/admin/orders/${orderNumber}`);
  const session = await getSession();

  if (!session) {
    return attachRequestContext(
      NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(getSafeRedirectPath(redirectTo, "/admin/orders"))}`, request.url),
        303
      ),
      requestContext
    );
  }

  if (!canUpdateOrderStatus(session.role)) {
    await recordAuditEvent({
      action: "admin.order_status_update_denied",
      entityType: "order",
      userId: session.userId,
      requestContext,
      level: "warn",
      details: {
        orderNumber,
        nextStatus
      },
      message: "Admin order status update was denied"
    });

    return attachRequestContext(
      NextResponse.redirect(new URL("/account?adminDenied=1", request.url), 303),
      requestContext
    );
  }

  if (!orderNumber) {
    return attachRequestContext(
      NextResponse.redirect(buildRedirectUrl(request, redirectTo, { error: "order-not-found" }), 303),
      requestContext
    );
  }

  if (!isOrderStatus(nextStatus)) {
    return attachRequestContext(
      NextResponse.redirect(buildRedirectUrl(request, redirectTo, { error: "invalid-status" }), 303),
      requestContext
    );
  }

  const order = await dbOrders.findByOrderNumberForAdmin(orderNumber);

  if (!order) {
    return attachRequestContext(
      NextResponse.redirect(buildRedirectUrl(request, redirectTo, { error: "order-not-found" }), 303),
      requestContext
    );
  }

  if (!getAllowedOrderStatusUpdates(order.status).includes(nextStatus)) {
    await recordAuditEvent({
      action: "admin.order_status_update_rejected",
      entityType: "order",
      entityId: order.id,
      userId: session.userId,
      requestContext,
      level: "warn",
      details: {
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        nextStatus
      },
      message: "Admin order status update was rejected"
    });

    return attachRequestContext(
      NextResponse.redirect(buildRedirectUrl(request, redirectTo, { error: "invalid-transition" }), 303),
      requestContext
    );
  }

  const now = new Date();

  try {
    await dbOrders.updateStatus({
      orderNumber: order.orderNumber,
      status: nextStatus,
      placedAt: nextStatus === "draft" ? order.placedAt : order.placedAt || now,
      paidAt:
        nextStatus === "paid" || nextStatus === "fulfilled"
          ? order.paidAt || now
          : nextStatus === "cancelled"
            ? order.paidAt
            : nextStatus === "failed"
              ? null
              : order.paidAt,
      failedAt:
        nextStatus === "failed"
          ? order.failedAt || now
          : nextStatus === "cancelled"
            ? order.failedAt
            : null,
      fulfilledAt: nextStatus === "fulfilled" ? order.fulfilledAt || now : null,
      cancelledAt: nextStatus === "cancelled" ? order.cancelledAt || now : null
    });
  } catch (error) {
    await captureServerError({
      event: "admin.order_status_update_failed",
      message: "Unexpected error while updating order status",
      requestId: requestContext.requestId,
      route: requestContext.route,
      userId: session.userId,
      data: {
        orderNumber: order.orderNumber,
        nextStatus
      },
      error
    });

    return attachRequestContext(
      NextResponse.redirect(buildRedirectUrl(request, redirectTo, { error: "status-update-failed" }), 303),
      requestContext
    );
  }

  await recordAuditEvent({
    action: "order.status_updated_by_admin",
    entityType: "order",
    entityId: order.id,
    userId: session.userId,
    requestContext,
    details: {
      orderNumber: order.orderNumber,
      previousStatus: order.status,
      nextStatus
    },
    message: "Admin updated order status"
  });

  return attachRequestContext(
    NextResponse.redirect(buildRedirectUrl(request, redirectTo, { updated: "1" }), 303),
    requestContext
  );
}
