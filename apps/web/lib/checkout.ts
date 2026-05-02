import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getSession, normalizePhone } from "@/lib/auth";
import { clearGuestCartCookie, resolveActiveCartRecord } from "@/lib/cart";
import { dbOrders } from "@/lib/db";
import { prisma } from "@/lib/db/prisma";
import { recordAuditEvent } from "@/lib/observability/audit";
import { captureServerError } from "@/lib/observability/monitoring";
import type { RequestContext } from "@/lib/observability/request";
import { canUseDevelopmentPaymentTools, getPaymentProvider, getPaymentProviderPresentation } from "@/lib/payment";

export const ORDER_CONFIRMATION_COOKIE_NAME = "fumgpt_recent_order";
const ORDER_CONFIRMATION_COOKIE_MAX_AGE = 60 * 60 * 24 * 2;
export const ORDER_STATUS_VALUES = [
  "draft",
  "pending_payment",
  "paid",
  "failed",
  "fulfilled",
  "cancelled"
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export type CheckoutInput = {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  shippingRecipientName?: string;
  shippingPhone?: string;
  shippingProvince?: string;
  shippingCity?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingPostalCode?: string;
};

type NormalizedCheckoutInput = {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  shippingRecipientName?: string;
  shippingPhone?: string;
  shippingProvince?: string;
  shippingCity?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingPostalCode?: string;
};

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["draft", "pending_payment", "cancelled"],
  pending_payment: ["pending_payment", "paid", "failed", "cancelled"],
  paid: ["paid", "fulfilled", "cancelled"],
  failed: ["failed", "pending_payment", "cancelled"],
  fulfilled: ["fulfilled"],
  cancelled: ["cancelled"]
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function normalizeText(value: string | undefined | null) {
  return (value || "").trim();
}

function assertMaxLength(value: string | undefined, maxLength: number) {
  if (value && value.length > maxLength) {
    throw new Error("field-too-long");
  }
}

function normalizeOptionalEmail(value: string | undefined) {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
    throw new Error("invalid-email");
  }

  return normalizedValue;
}

function normalizeCheckoutPhone(value: string | undefined) {
  const normalizedValue = normalizePhone(normalizeDigits(normalizeText(value)));

  if (!normalizedValue || !/^0\d{9,}$/.test(normalizedValue)) {
    throw new Error("invalid-phone");
  }

  return normalizedValue;
}

function hasShippingInput(input: CheckoutInput) {
  return Boolean(
    normalizeText(input.shippingRecipientName) ||
      normalizeText(input.shippingPhone) ||
      normalizeText(input.shippingProvince) ||
      normalizeText(input.shippingCity) ||
      normalizeText(input.shippingAddressLine1) ||
      normalizeText(input.shippingAddressLine2) ||
      normalizeText(input.shippingPostalCode)
  );
}

export function normalizeCheckoutInput(input: CheckoutInput) {
  const fullName = normalizeText(input.fullName);

  if (fullName.length < 3) {
    throw new Error("missing-full-name");
  }

  const phone = normalizeCheckoutPhone(input.phone);
  const email = normalizeOptionalEmail(input.email);
  const notes = normalizeText(input.notes) || undefined;

  assertMaxLength(fullName, 120);
  assertMaxLength(notes, 1000);

  if (!hasShippingInput(input)) {
    return {
      fullName,
      phone,
      email,
      notes
    } satisfies NormalizedCheckoutInput;
  }

  const shippingProvince = normalizeText(input.shippingProvince);
  const shippingCity = normalizeText(input.shippingCity);
  const shippingAddressLine1 = normalizeText(input.shippingAddressLine1);
  const shippingRecipientName = normalizeText(input.shippingRecipientName) || fullName;
  const shippingPhone = normalizeText(input.shippingPhone)
    ? normalizeCheckoutPhone(input.shippingPhone)
    : phone;
  const shippingAddressLine2 = normalizeText(input.shippingAddressLine2) || undefined;
  const shippingPostalCode = normalizeText(input.shippingPostalCode) || undefined;

  if (!shippingProvince || !shippingCity || !shippingAddressLine1) {
    throw new Error("missing-shipping-fields");
  }

  assertMaxLength(shippingRecipientName, 120);
  assertMaxLength(shippingPhone, 20);
  assertMaxLength(shippingProvince, 80);
  assertMaxLength(shippingCity, 80);
  assertMaxLength(shippingAddressLine1, 300);
  assertMaxLength(shippingAddressLine2, 300);
  assertMaxLength(shippingPostalCode, 20);

  return {
    fullName,
    phone,
    email,
    notes,
    shippingRecipientName,
    shippingPhone,
    shippingProvince,
    shippingCity,
    shippingAddressLine1,
    shippingAddressLine2,
    shippingPostalCode
  } satisfies NormalizedCheckoutInput;
}

export function getOrderStatusMeta(status: string) {
  switch (status as OrderStatus) {
    case "draft":
      return {
        label: "پیش‌نویس",
        toneClassName: "chip"
      };
    case "pending_payment":
      return {
        label: "در انتظار پرداخت",
        toneClassName: "chip"
      };
    case "paid":
      return {
        label: "پرداخت‌شده",
        toneClassName: "chip"
      };
    case "failed":
      return {
        label: "ناموفق",
        toneClassName: "chip"
      };
    case "fulfilled":
      return {
        label: "انجام‌شده",
        toneClassName: "chip"
      };
    case "cancelled":
      return {
        label: "لغوشده",
        toneClassName: "chip"
      };
    default:
      return {
        label: status,
        toneClassName: "chip"
      };
  }
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

export function getAllowedOrderStatusUpdates(status: string) {
  if (!isOrderStatus(status)) {
    return ORDER_STATUS_VALUES;
  }

  return ORDER_STATUS_TRANSITIONS[status];
}

export function getCheckoutErrorMessage(error?: string) {
  switch (error) {
    case "empty-cart":
      return "سبد خرید خالی است و امکان ثبت سفارش وجود ندارد.";
    case "missing-full-name":
      return "نام و نام خانوادگی برای ثبت سفارش لازم است.";
    case "invalid-phone":
      return "شماره تماس معتبر وارد نشده است.";
    case "invalid-email":
      return "ایمیل واردشده معتبر نیست.";
    case "field-too-long":
      return "ÛŒÚ©ÛŒ Ø§Ø² ÙÛŒÙ„Ø¯Ù‡Ø§ Ø¨ÛŒØ´ Ø§Ø² Ø­Ø¯ Ù…Ø¬Ø§Ø² ØªÙˆÙ„Ø§Ù†ÛŒ Ø§Ø³Øª. Ù„Ø·ÙØ§ Ù…ØªÙ† Ú©ÙˆØªØ§Ù‡â€ŒØªØ±ÛŒ ÙˆØ§Ø±Ø¯ Ú©Ù†.";
    case "missing-shipping-fields":
      return "اگر آدرس ارسال وارد می‌کنی، استان، شهر و نشانی کامل را هم تکمیل کن.";
    case "payment-init-failed":
      return "ثبت سفارش انجام شد اما آماده‌سازی مسیر پرداخت با خطا مواجه شد. دوباره تلاش کن.";
    default:
      return null;
  }
}

export function setRecentOrderCookie(response: NextResponse, orderNumber: string) {
  response.cookies.set({
    name: ORDER_CONFIRMATION_COOKIE_NAME,
    value: orderNumber,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ORDER_CONFIRMATION_COOKIE_MAX_AGE
  });
}

export function clearCheckoutCookies(response: NextResponse) {
  clearGuestCartCookie(response);
}

export async function createOrderFromCheckout(params: {
  input: CheckoutInput;
  userId?: string | null;
  guestCartId?: string | null;
  requestContext?: Pick<RequestContext, "requestId" | "route" | "method" | "ipAddress">;
}) {
  const normalizedInput = normalizeCheckoutInput(params.input);
  const activeCart = await resolveActiveCartRecord({
    userId: params.userId,
    guestCartId: params.guestCartId
  });

  if (!activeCart || activeCart.cart.items.length === 0) {
    throw new Error("empty-cart");
  }

  const subtotalAmount = activeCart.cart.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );
  const paymentProvider = getPaymentProvider();

  const draftOrder = await dbOrders.create({
    userId: params.userId || undefined,
    sourceCartId: activeCart.cart.id,
    status: "draft",
    customerName: normalizedInput.fullName,
    customerPhone: normalizedInput.phone,
    customerEmail: normalizedInput.email,
    paymentProvider: paymentProvider.key,
    subtotalAmount,
    notes: normalizedInput.notes,
    shippingRecipientName: normalizedInput.shippingRecipientName,
    shippingPhone: normalizedInput.shippingPhone,
    shippingProvince: normalizedInput.shippingProvince,
    shippingCity: normalizedInput.shippingCity,
    shippingAddressLine1: normalizedInput.shippingAddressLine1,
    shippingAddressLine2: normalizedInput.shippingAddressLine2,
    shippingPostalCode: normalizedInput.shippingPostalCode,
    items: activeCart.cart.items.map((item) => ({
      productSlug: item.productSlug,
      titleSnapshot: item.titleSnapshot,
      unitPrice: item.unitPrice,
      quantity: item.quantity
    }))
  });

  await recordAuditEvent({
    action: "order.draft_created",
    entityType: "order",
    entityId: draftOrder.id,
    userId: params.userId || undefined,
    requestContext: params.requestContext,
    details: {
      orderNumber: draftOrder.orderNumber,
      cartId: activeCart.cart.id,
      subtotalAmount
    },
    message: "Draft order created from cart"
  });

  try {
    const paymentResult = await paymentProvider.createPayment({
      orderId: draftOrder.id,
      orderNumber: draftOrder.orderNumber,
      amount: subtotalAmount,
      currency: draftOrder.currency
    });
    const now = new Date();
    const finalizedStatus = paymentResult.status;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: draftOrder.id },
        data: {
          status: finalizedStatus,
          paymentReference: paymentResult.paymentReference,
          placedAt: now,
          paidAt: finalizedStatus === "paid" ? now : null,
          failedAt: null
        }
      });

      await tx.cart.update({
        where: { id: activeCart.cart.id },
        data: {
          status: "checked_out",
          checkedOutAt: now,
          updatedAt: now
        }
      });
    });

    await recordAuditEvent({
      action: finalizedStatus === "paid" ? "order.paid" : "order.submitted",
      entityType: "order",
      entityId: draftOrder.id,
      userId: params.userId || undefined,
      requestContext: params.requestContext,
      details: {
        orderNumber: draftOrder.orderNumber,
        paymentProvider: paymentProvider.key,
        status: finalizedStatus,
        paymentReference: paymentResult.paymentReference
      },
      message: paymentResult.message
    });

    const finalizedOrder = await dbOrders.findByOrderNumber(draftOrder.orderNumber);

    if (!finalizedOrder) {
      throw new Error("order-not-found");
    }

    return {
      order: finalizedOrder,
      paymentMessage: paymentResult.message,
      paymentProvider: getPaymentProviderPresentation()
    };
  } catch (error) {
    await dbOrders.updateStatus({
      orderId: draftOrder.id,
      status: "failed",
      failedAt: new Date()
    });

    await recordAuditEvent({
      action: "order.payment_failed",
      entityType: "order",
      entityId: draftOrder.id,
      userId: params.userId || undefined,
      requestContext: params.requestContext,
      level: "error",
      details: {
        orderNumber: draftOrder.orderNumber,
        reason: error instanceof Error ? error.message : "payment-init-failed"
      },
      message: "Order payment initialization failed"
    });
    await captureServerError({
      event: "order.payment_failed",
      message: "Failed to initialize order payment",
      requestId: params.requestContext?.requestId,
      route: params.requestContext?.route,
      userId: params.userId || undefined,
      data: {
        orderNumber: draftOrder.orderNumber,
        paymentProvider: paymentProvider.key
      },
      error
    });

    throw new Error("payment-init-failed");
  }
}

export async function getOrderForCurrentViewer(orderNumber: string) {
  const [order, session, cookieStore] = await Promise.all([
    dbOrders.findByOrderNumber(orderNumber),
    getSession(),
    cookies()
  ]);

  if (!order) {
    return null;
  }

  const recentOrderNumber = cookieStore.get(ORDER_CONFIRMATION_COOKIE_NAME)?.value || null;

  if (order.userId && session?.userId === order.userId) {
    return order;
  }

  if (recentOrderNumber === order.orderNumber) {
    return order;
  }

  return null;
}

export async function listOrdersForCurrentUser(limit = 5) {
  const session = await getSession();

  if (!session?.userId) {
    return [];
  }

  return dbOrders.listRecentByUserId(session.userId, limit);
}

export async function listOrdersForUser(userId: string, limit = 5) {
  return dbOrders.listRecentByUserId(userId, limit);
}

export function getOrderTimelineMessage(params: {
  status: string;
  paymentProvider: string;
}) {
  if (params.status === "paid") {
    return "پرداخت این سفارش ثبت شده است و مرحله بعدی، آماده‌سازی و انجام سفارش خواهد بود.";
  }

  if (params.status === "fulfilled") {
    return "این سفارش انجام شده است و در سابقه حساب شما نگه‌داری می‌شود.";
  }

  if (params.status === "failed") {
    return "پرداخت یا ثبت نهایی این سفارش کامل نشده است. اگر هنوز به آن نیاز داری، دوباره از سبد خرید اقدام کن.";
  }

  if (params.status === "cancelled") {
    return "این سفارش لغو شده است. در صورت نیاز می‌توانی سفارش تازه‌ای ثبت کنی.";
  }

  if (params.paymentProvider === "dev_mock") {
    return "این سفارش در حالت توسعه ثبت شده است و پرداخت آن فقط برای تست شبیه‌سازی می‌شود.";
  }

  return "این سفارش ثبت شده و در انتظار پیگیری پرداخت است. تا زمان اتصال gateway واقعی، پرداخت از مسیر دستی و شفاف ادامه پیدا می‌کند.";
}

export function canShowDevelopmentPaymentTools(params: {
  status: string;
  paymentProvider: string;
}) {
  return params.status === "pending_payment" && params.paymentProvider === "dev_mock" && canUseDevelopmentPaymentTools();
}
