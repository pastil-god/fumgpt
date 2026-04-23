import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildCartRedirectUrl,
  getGuestCartIdFromRequest,
  updateCartItemQuantity
} from "@/lib/cart";

function getCartErrorCode(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const itemId = String(formData.get("itemId") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/cart");
  const quantity = Number(formData.get("quantity") || "1");
  const guestCartId = getGuestCartIdFromRequest(request);
  const session = await getSession();

  if (!itemId) {
    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cartError: "cart-item-not-found"
      }),
      303
    );
  }

  try {
    await updateCartItemQuantity({
      itemId,
      quantity,
      userId: session?.userId,
      guestCartId
    });

    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cart: quantity <= 0 ? "removed" : "updated"
      }),
      303
    );
  } catch (error) {
    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cartError: getCartErrorCode(error, "cart-update-failed")
      }),
      303
    );
  }
}
