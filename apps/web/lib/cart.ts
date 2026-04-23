import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStoreProducts, getStoreProductBySlug } from "@/lib/content";
import type { Product } from "@/lib/mock-data";
import { prisma } from "@/lib/db/prisma";

export const CART_COOKIE_NAME = "fumgpt_cart";
const MAX_CART_ITEM_QUANTITY = 99;

type CartRecord = Awaited<ReturnType<typeof loadCartById>>;
type LoadedCart = NonNullable<CartRecord>;

export type CartLine = {
  id: string;
  cartId: string;
  productSlug: string;
  title: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  product: Product | null;
};

export type CartSummary = {
  cartId: string | null;
  source: "guest" | "user" | "empty";
  items: CartLine[];
  itemCount: number;
  subtotal: number;
};

export type ActiveCartRecord = {
  source: "guest" | "user";
  cart: LoadedCart;
};

function getSafeCartRedirectPath(value: string | null, fallback = "/cart") {
  const normalizedValue = value?.trim();

  if (!normalizedValue || !normalizedValue.startsWith("/") || normalizedValue.startsWith("//")) {
    return fallback;
  }

  return normalizedValue;
}

function isGuestCart(cart: { userId: string | null }) {
  return !cart.userId;
}

async function loadCartById(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });
}

async function loadOpenCartByUserId(userId: string) {
  return prisma.cart.findFirst({
    where: {
      userId,
      status: "open"
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });
}

async function buildCartLines(items: Array<{
  id: string;
  cartId: string;
  productSlug: string;
  titleSnapshot: string;
  unitPrice: number;
  quantity: number;
}>) {
  if (items.length === 0) {
    return [] satisfies CartLine[];
  }

  const products = await getStoreProducts();
  const productMap = new Map(products.map((product) => [product.slug, product]));

  return items.map((item) => {
    const product = productMap.get(item.productSlug) || null;

    return {
      id: item.id,
      cartId: item.cartId,
      productSlug: item.productSlug,
      title: product?.title || item.titleSnapshot,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.unitPrice * item.quantity,
      product
    } satisfies CartLine;
  });
}

function summarizeCart(lines: CartLine[], source: CartSummary["source"], cartId: string | null) {
  return {
    cartId,
    source,
    items: lines,
    itemCount: lines.reduce((total, item) => total + item.quantity, 0),
    subtotal: lines.reduce((total, item) => total + item.totalPrice, 0)
  } satisfies CartSummary;
}

function normalizeCartQuantity(value: number | undefined, fallback = 1) {
  const quantity = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.min(MAX_CART_ITEM_QUANTITY, Math.max(1, quantity));
}

function normalizeCartQuantityForUpdate(value: number) {
  const quantity = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 1;

  if (quantity <= 0) {
    return 0;
  }

  return Math.min(MAX_CART_ITEM_QUANTITY, quantity);
}

async function createGuestCart() {
  return prisma.cart.create({
    data: {
      status: "open",
      currency: "IRR"
    },
    include: {
      items: true
    }
  });
}

async function createUserCart(userId: string) {
  return prisma.cart.create({
    data: {
      userId,
      status: "open",
      currency: "IRR"
    },
    include: {
      items: true
    }
  });
}

async function touchCart(cartId: string) {
  return prisma.cart.update({
    where: { id: cartId },
    data: {
      updatedAt: new Date()
    }
  });
}

async function resolveWritableCart(params: {
  userId?: string | null;
  guestCartId?: string | null;
}) {
  if (params.userId) {
    const openUserCart = await loadOpenCartByUserId(params.userId);

    if (openUserCart) {
      return {
        cart: openUserCart,
        shouldSetGuestCookie: false
      };
    }

    return {
      cart: await createUserCart(params.userId),
      shouldSetGuestCookie: false
    };
  }

  if (params.guestCartId) {
    const existingGuestCart = await loadCartById(params.guestCartId);

    if (existingGuestCart && existingGuestCart.status === "open" && isGuestCart(existingGuestCart)) {
      return {
        cart: existingGuestCart,
        shouldSetGuestCookie: false
      };
    }
  }

  return {
    cart: await createGuestCart(),
    shouldSetGuestCookie: true
  };
}

async function findOwnedCartItem(params: {
  itemId: string;
  userId?: string | null;
  guestCartId?: string | null;
}) {
  return prisma.cartItem.findFirst({
    where: {
      id: params.itemId,
      cart: params.userId
        ? {
            userId: params.userId,
            status: "open"
          }
        : {
            id: params.guestCartId || "__missing__",
            userId: null,
            status: "open"
          }
    },
    include: {
      cart: true
    }
  });
}

export function setGuestCartCookie(response: NextResponse, cartId: string) {
  response.cookies.set({
    name: CART_COOKIE_NAME,
    value: cartId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearGuestCartCookie(response: NextResponse) {
  response.cookies.delete(CART_COOKIE_NAME);
}

export function getGuestCartIdFromRequest(request: NextRequest) {
  return request.cookies.get(CART_COOKIE_NAME)?.value || null;
}

export function buildCartRedirectUrl(
  request: NextRequest,
  redirectTo: string | null,
  params?: Record<string, string | undefined>
) {
  const safePath = getSafeCartRedirectPath(redirectTo, "/cart");
  const url = new URL(safePath, request.url);

  for (const [key, value] of Object.entries(params || {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function resolveActiveCartRecord(params: {
  userId?: string | null;
  guestCartId?: string | null;
}) {
  if (params.userId) {
    const userCart = await loadOpenCartByUserId(params.userId);

    if (userCart) {
      return {
        source: "user",
        cart: userCart
      } satisfies ActiveCartRecord;
    }
  }

  if (params.guestCartId) {
    const guestCart = await loadCartById(params.guestCartId);

    if (guestCart && guestCart.status === "open" && isGuestCart(guestCart)) {
      return {
        source: "guest",
        cart: guestCart
      } satisfies ActiveCartRecord;
    }
  }

  return null;
}

export async function markCartCheckedOut(cartId: string) {
  return prisma.cart.update({
    where: { id: cartId },
    data: {
      status: "checked_out",
      checkedOutAt: new Date(),
      updatedAt: new Date()
    },
    include: {
      items: true
    }
  });
}

export async function getActiveCart() {
  const cookieStore = await cookies();
  const guestCartId = cookieStore.get(CART_COOKIE_NAME)?.value || null;
  const session = await getSession();

  if (session?.userId) {
    const userCart = await loadOpenCartByUserId(session.userId);

    if (!userCart) {
      return summarizeCart([], "empty", null);
    }

    const lines = await buildCartLines(userCart.items);
    return summarizeCart(lines, "user", userCart.id);
  }

  if (guestCartId) {
    const guestCart = await loadCartById(guestCartId);

    if (guestCart && guestCart.status === "open" && isGuestCart(guestCart)) {
      const lines = await buildCartLines(guestCart.items);
      return summarizeCart(lines, "guest", guestCart.id);
    }
  }

  return summarizeCart([], "empty", null);
}

export async function addProductToCart(params: {
  productSlug: string;
  quantity?: number;
  userId?: string | null;
  guestCartId?: string | null;
}) {
  const product = await getStoreProductBySlug(params.productSlug);

  if (!product) {
    throw new Error("product-not-found");
  }

  const quantity = normalizeCartQuantity(params.quantity);
  const { cart, shouldSetGuestCookie } = await resolveWritableCart({
    userId: params.userId,
    guestCartId: params.guestCartId
  });

  await prisma.$transaction(async (tx) => {
    const existingItem = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productSlug: product.slug
      }
    });

    if (existingItem) {
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: {
            increment: quantity
          }
        }
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productSlug: product.slug,
          titleSnapshot: product.title,
          unitPrice: product.price,
          quantity
        }
      });
    }

    await tx.cart.update({
      where: { id: cart.id },
      data: {
        updatedAt: new Date()
      }
    });
  });

  return {
    cartId: cart.id,
    shouldSetGuestCookie
  };
}

export async function updateCartItemQuantity(params: {
  itemId: string;
  quantity: number;
  userId?: string | null;
  guestCartId?: string | null;
}) {
  const ownedItem = await findOwnedCartItem(params);

  if (!ownedItem) {
    throw new Error("cart-item-not-found");
  }

  const quantity = normalizeCartQuantityForUpdate(params.quantity);

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: ownedItem.id }
    });
  } else {
    await prisma.cartItem.update({
      where: { id: ownedItem.id },
      data: {
        quantity
      }
    });
  }

  await touchCart(ownedItem.cartId);
}

export async function removeCartItem(params: {
  itemId: string;
  userId?: string | null;
  guestCartId?: string | null;
}) {
  const ownedItem = await findOwnedCartItem(params);

  if (!ownedItem) {
    throw new Error("cart-item-not-found");
  }

  await prisma.cartItem.delete({
    where: { id: ownedItem.id }
  });

  await touchCart(ownedItem.cartId);
}

export async function mergeGuestCartIntoUserCart(params: {
  guestCartId: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findFirst({
      where: {
        id: params.guestCartId,
        userId: null,
        status: "open"
      },
      include: {
        items: true
      }
    });

    if (!guestCart || guestCart.items.length === 0) {
      return null;
    }

    const userCart = await tx.cart.findFirst({
      where: {
        userId: params.userId,
        status: "open"
      },
      include: {
        items: true
      }
    });

    if (!userCart) {
      const attachedCart = await tx.cart.update({
        where: { id: guestCart.id },
        data: {
          userId: params.userId,
          updatedAt: new Date()
        }
      });

      return attachedCart.id;
    }

    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find((item) => item.productSlug === guestItem.productSlug);

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: {
              increment: guestItem.quantity
            }
          }
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCart.id,
            productSlug: guestItem.productSlug,
            titleSnapshot: guestItem.titleSnapshot,
            unitPrice: guestItem.unitPrice,
            quantity: guestItem.quantity
          }
        });
      }
    }

    await tx.cart.delete({
      where: { id: guestCart.id }
    });

    await tx.cart.update({
      where: { id: userCart.id },
      data: {
        updatedAt: new Date()
      }
    });

    return userCart.id;
  });
}
