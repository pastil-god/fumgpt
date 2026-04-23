import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildCartRedirectUrl,
  getGuestCartIdFromRequest,
  removeCartItem
} from "@/lib/cart";

function getCartErrorCode(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const itemId = String(formData.get("itemId") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/cart");
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
    await removeCartItem({
      itemId,
      userId: session?.userId,
      guestCartId
    });

    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cart: "removed"
      }),
      303
    );
  } catch (error) {
    return NextResponse.redirect(
      buildCartRedirectUrl(request, redirectTo, {
        cartError: getCartErrorCode(error, "cart-remove-failed")
      }),
      303
    );
  }
}
