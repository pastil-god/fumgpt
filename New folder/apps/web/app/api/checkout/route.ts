import { NextRequest, NextResponse } from "next/server";
import { scheduleRequestAnalyticsEvent } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { getGuestCartIdFromRequest } from "@/lib/cart";
import {
  clearCheckoutCookies,
  createOrderFromCheckout,
  setRecentOrderCookie,
  type CheckoutInput
} from "@/lib/checkout";
import { recordAuditEvent } from "@/lib/observability/audit";
import { captureServerError } from "@/lib/observability/monitoring";
import { attachRequestContext, createRequestContext } from "@/lib/observability/request";

function buildCheckoutUrl(request: NextRequest, params: Record<string, string | undefined>) {
  const url = new URL("/checkout", request.url);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function POST(request: NextRequest) {
  const requestContext = createRequestContext(request, "/api/checkout");
  const formData = await request.formData();
  const session = await getSession();
  const guestCartId = getGuestCartIdFromRequest(request);
  const input = {
    fullName: String(formData.get("fullName") || ""),
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    notes: String(formData.get("notes") || ""),
    shippingRecipientName: String(formData.get("shippingRecipientName") || ""),
    shippingPhone: String(formData.get("shippingPhone") || ""),
    shippingProvince: String(formData.get("shippingProvince") || ""),
    shippingCity: String(formData.get("shippingCity") || ""),
    shippingAddressLine1: String(formData.get("shippingAddressLine1") || ""),
    shippingAddressLine2: String(formData.get("shippingAddressLine2") || ""),
    shippingPostalCode: String(formData.get("shippingPostalCode") || "")
  } satisfies CheckoutInput;

  try {
    const result = await createOrderFromCheckout({
      input,
      userId: session?.userId,
      guestCartId,
      requestContext
    });

    scheduleRequestAnalyticsEvent({
      name: "order_created",
      request,
      requestContext,
      path: `/checkout/confirmation/${result.order.orderNumber}`,
      userId: session?.userId || undefined,
      sessionKind: session ? "authenticated" : "guest",
      entityType: "order",
      entityId: result.order.orderNumber,
      metadata: {
        orderNumber: result.order.orderNumber,
        itemCount: result.order.items.length,
        subtotalAmount: result.order.subtotalAmount,
        status: result.order.status,
        paymentProvider: result.order.paymentProvider
      }
    });

    const response = attachRequestContext(
      NextResponse.redirect(
      new URL(`/checkout/confirmation/${result.order.orderNumber}?placed=1`, request.url),
      303
      ),
      requestContext
    );

    setRecentOrderCookie(response, result.order.orderNumber);
    clearCheckoutCookies(response);

    return response;
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : "checkout-failed";

    await recordAuditEvent({
      action: "order.checkout_failed",
      entityType: "order",
      requestContext,
      userId: session?.userId,
      level: "warn",
      details: {
        error: errorCode
      },
      message: "Checkout attempt failed"
    });

    if (errorCode === "checkout-failed") {
      await captureServerError({
        event: "order.checkout_failed",
        message: "Unexpected checkout failure",
        requestId: requestContext.requestId,
        route: requestContext.route,
        userId: session?.userId,
        error
      });
    }

    return attachRequestContext(
      NextResponse.redirect(
      buildCheckoutUrl(request, {
        error: errorCode
      }),
      303
      ),
      requestContext
    );
  }
}
