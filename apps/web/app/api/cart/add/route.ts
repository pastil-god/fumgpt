import { NextRequest, NextResponse } from "next/server";
import { scheduleRequestAnalyticsEvent } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import {
  addProductToCart,
  buildCartRedirectUrl,
  getGuestCartIdFromRequest,
  setGuestCartCookie
} from "@/lib/cart";

function getCartErrorCode(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const productSlug = String(formData.get("productSlug") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/cart");
  const quantity = Number(formData.get("quantity") || "1");
  const guestCartId = getGuestCartIdFromRequest(request);
  const session = await getSession();

  if (!productSlug) {
    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cartError: "product-not-found"
      }),
      303
    );
  }

  try {
    const result = await addProductToCart({
      productSlug,
      quantity,
      userId: session?.userId,
      guestCartId
    });

    scheduleRequestAnalyticsEvent({
      name: "add_to_cart",
      request,
      path: redirectTo,
      userId: session?.userId,
      sessionKind: session ? "authenticated" : "guest",
      entityType: "product",
      entityId: productSlug,
      metadata: {
        quantity,
        cartId: result.cartId,
        redirectTo
      }
    });

    const response = NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cart: "added"
      }),
      303
    );

    if (!session?.userId && result.shouldSetGuestCookie) {
      setGuestCartCookie(response, result.cartId);
    }

    return response;
  } catch (error) {
    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cartError: getCartErrorCode(error, "cart-add-failed")
      }),
      303
    );
  }
}
