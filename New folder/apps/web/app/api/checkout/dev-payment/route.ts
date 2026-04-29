import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbOrders } from "@/lib/db";
import { ORDER_CONFIRMATION_COOKIE_NAME } from "@/lib/checkout";
import { recordAuditEvent } from "@/lib/observability/audit";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";
import { canUseDevelopmentPaymentTools } from "@/lib/payment";

function buildConfirmationUrl(request: NextRequest, orderNumber: string, params?: Record<string, string | undefined>) {
  const url = new URL(`/checkout/confirmation/${orderNumber}`, request.url);

  for (const [key, value] of Object.entries(params || {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/checkout/dev-payment");
  const formData = await request.formData();
  const orderNumber = String(formData.get("orderNumber") || "").trim();
  const paymentAction = String(formData.get("paymentAction") || "").trim();
  const session = await getSession();
  const recentOrderNumber = request.cookies.get(ORDER_CONFIRMATION_COOKIE_NAME)?.value || null;

  if (!canUseDevelopmentPaymentTools()) {
    return attachRequestContext(
      NextResponse.redirect(
      buildConfirmationUrl(request, orderNumber || "", {
        paymentError: "dev-tools-disabled"
      }),
      303
      ),
      requestContext
    );
  }

  if (!orderNumber || (paymentAction !== "paid" && paymentAction !== "failed")) {
    return attachRequestContext(NextResponse.redirect(new URL("/checkout", request.url), 303), requestContext);
  }

  const order = await dbOrders.findByOrderNumber(orderNumber);

  if (!order) {
    return attachRequestContext(NextResponse.redirect(new URL("/checkout", request.url), 303), requestContext);
  }

  const canAccess =
    (order.userId && session?.userId === order.userId) || recentOrderNumber === order.orderNumber;

  if (!canAccess) {
    return attachRequestContext(NextResponse.redirect(new URL("/account", request.url), 303), requestContext);
  }

  const now = new Date();

  await dbOrders.updateStatus({
    orderNumber: order.orderNumber,
    status: paymentAction === "paid" ? "paid" : "failed",
    paidAt: paymentAction === "paid" ? now : null,
    failedAt: paymentAction === "failed" ? now : null
  });

  await recordAuditEvent({
    action: paymentAction === "paid" ? "order.dev_paid" : "order.dev_failed",
    entityType: "order",
    entityId: order.id,
    userId: order.userId || undefined,
    requestContext,
    details: {
      orderNumber: order.orderNumber,
      paymentAction
    },
    message: "Development payment status updated"
  });

  return attachRequestContext(
    NextResponse.redirect(
      buildConfirmationUrl(request, order.orderNumber, {
        payment: paymentAction
      }),
      303
    ),
    requestContext
  );
}
