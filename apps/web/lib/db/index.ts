import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function getDatabaseHealth() {
  const configured = Boolean(process.env.DATABASE_URL);
  const checkedAt = new Date().toISOString();
  const provider = "postgresql";

  if (!configured) {
    return {
      configured: false,
      connected: false,
      provider,
      mode: "not-configured" as const,
      latencyMs: null,
      checkedAt
    };
  }

  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      configured: true,
      connected: true,
      provider,
      mode: "connected" as const,
      latencyMs: Date.now() - startedAt,
      checkedAt
    };
  } catch {
    return {
      configured: true,
      connected: false,
      provider,
      mode: "error" as const,
      latencyMs: Date.now() - startedAt,
      checkedAt
    };
  }
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export const dbUsers = {
  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        authIdentities: true
      }
    });
  },

  findByIdentifier(identifier: string) {
    const normalized = normalizeIdentifier(identifier);

    return prisma.user.findFirst({
      where: {
        OR: [{ email: normalized }, { phone: normalized }]
      },
      include: {
        profile: true,
        authIdentities: true
      }
    });
  },

  create(params: {
    email?: string;
    phone?: string;
    role?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
  }) {
    return prisma.user.create({
      data: {
        email: params.email ? normalizeIdentifier(params.email) : undefined,
        phone: params.phone ? params.phone.trim() : undefined,
        role: params.role || "customer",
        profile:
          params.displayName || params.firstName || params.lastName
            ? {
                create: {
                  displayName: params.displayName,
                  firstName: params.firstName,
                  lastName: params.lastName
                }
              }
            : undefined
      },
      include: {
        profile: true
      }
    });
  },

  listForAdmin(limit = 50) {
    return prisma.user.findMany({
      include: {
        profile: true,
        orders: {
          orderBy: {
            createdAt: "desc"
          },
          take: 3
        },
        _count: {
          select: {
            orders: true,
            supportRequests: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
  },

  searchForAdminLookup(query: string, limit = 12) {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return Promise.resolve([]);
    }

    return prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: normalizedQuery.toLowerCase()
            }
          },
          {
            phone: {
              contains: normalizedQuery
            }
          },
          {
            profile: {
              is: {
                OR: [
                  {
                    displayName: {
                      contains: normalizedQuery
                    }
                  },
                  {
                    firstName: {
                      contains: normalizedQuery
                    }
                  },
                  {
                    lastName: {
                      contains: normalizedQuery
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      include: {
        profile: true,
        orders: {
          orderBy: {
            createdAt: "desc"
          },
          take: 3
        },
        _count: {
          select: {
            orders: true,
            supportRequests: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
  }
};

export const dbAuthIdentities = {
  createPasswordIdentity(params: {
    userId: string;
    identifier: string;
    passwordHash?: string;
    provider?: string;
  }) {
    const identifier = normalizeIdentifier(params.identifier);

    return prisma.authIdentity.create({
      data: {
        userId: params.userId,
        provider: params.provider || "password",
        providerUserId: identifier,
        identifier,
        passwordHash: params.passwordHash,
        isPrimary: true
      }
    });
  },

  upsertOtpIdentity(params: {
    userId: string;
    identifier: string;
    provider: "email_otp" | "phone_otp";
  }) {
    const identifier = normalizeIdentifier(params.identifier);

    return prisma.authIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: params.provider,
          providerUserId: identifier
        }
      },
      update: {
        userId: params.userId,
        identifier,
        isPrimary: true,
        lastUsedAt: new Date()
      },
      create: {
        userId: params.userId,
        provider: params.provider,
        providerUserId: identifier,
        identifier,
        isPrimary: true,
        lastUsedAt: new Date()
      }
    });
  }
};

export const dbOtpCodes = {
  create(params: {
    identifier: string;
    code: string;
    purpose: string;
    channel?: string;
    expiresAt: Date;
    userId?: string;
  }) {
    return prisma.otpCode.create({
      data: {
        userId: params.userId,
        identifier: normalizeIdentifier(params.identifier),
        purpose: params.purpose,
        channel: params.channel || "sms",
        codeHash: hashSecret(params.code),
        expiresAt: params.expiresAt
      }
    });
  },

  consume(id: string) {
    return prisma.otpCode.update({
      where: { id },
      data: {
        consumedAt: new Date()
      }
    });
  },

  findLatestPending(params: {
    identifier: string;
    purpose: string;
    channel: string;
  }) {
    return prisma.otpCode.findFirst({
      where: {
        identifier: normalizeIdentifier(params.identifier),
        purpose: params.purpose,
        channel: params.channel,
        consumedAt: null
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  },

  countRecent(params: {
    identifier: string;
    purpose: string;
    channel: string;
    since: Date;
  }) {
    return prisma.otpCode.count({
      where: {
        identifier: normalizeIdentifier(params.identifier),
        purpose: params.purpose,
        channel: params.channel,
        createdAt: {
          gte: params.since
        }
      }
    });
  },

  invalidateActive(params: {
    identifier: string;
    purpose: string;
    channel: string;
  }) {
    return prisma.otpCode.updateMany({
      where: {
        identifier: normalizeIdentifier(params.identifier),
        purpose: params.purpose,
        channel: params.channel,
        consumedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      data: {
        consumedAt: new Date()
      }
    });
  },

  incrementAttempts(id: string) {
    return prisma.otpCode.update({
      where: { id },
      data: {
        attempts: {
          increment: 1
        }
      }
    });
  }
};

export const dbSessions = {
  create(params: {
    userId: string;
    token: string;
    expiresAt: Date;
    authMode?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.session.create({
      data: {
        userId: params.userId,
        tokenHash: hashSecret(params.token),
        expiresAt: params.expiresAt,
        authMode: params.authMode || "password",
        ipAddress: params.ipAddress,
        userAgent: params.userAgent
      }
    });
  },

  findActiveByToken(token: string) {
    return prisma.session.findFirst({
      where: {
        tokenHash: hashSecret(token),
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          include: {
            profile: true,
            authIdentities: true
          }
        }
      }
    });
  },

  revokeByToken(token: string) {
    return prisma.session.updateMany({
      where: {
        tokenHash: hashSecret(token),
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }
};

export const dbCarts = {
  findOpenByUserId(userId: string) {
    return prisma.cart.findFirst({
      where: {
        userId,
        status: "open"
      },
      include: {
        items: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  },

  createOpenCart(userId?: string) {
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
  },

  addItem(params: {
    cartId: string;
    productSlug: string;
    titleSnapshot: string;
    unitPrice: number;
    quantity: number;
  }) {
    return prisma.cartItem.create({
      data: {
        cartId: params.cartId,
        productSlug: params.productSlug,
        titleSnapshot: params.titleSnapshot,
        unitPrice: params.unitPrice,
        quantity: params.quantity
      }
    });
  }
};

function buildOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FG-${stamp}-${random}`;
}

export const dbOrders = {
  create(params: {
    userId?: string;
    addressId?: string;
    supportRequestId?: string;
    sourceCartId?: string;
    status?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    paymentProvider: string;
    paymentReference?: string;
    subtotalAmount: number;
    notes?: string;
    shippingRecipientName?: string;
    shippingPhone?: string;
    shippingProvince?: string;
    shippingCity?: string;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingPostalCode?: string;
    placedAt?: Date;
    paidAt?: Date;
    failedAt?: Date;
    fulfilledAt?: Date;
    cancelledAt?: Date;
    items: Array<{
      productSlug: string;
      titleSnapshot: string;
      unitPrice: number;
      quantity: number;
    }>;
  }) {
    return prisma.order.create({
      data: {
        userId: params.userId,
        addressId: params.addressId,
        supportRequestId: params.supportRequestId,
        sourceCartId: params.sourceCartId,
        orderNumber: buildOrderNumber(),
        status: params.status || "draft",
        subtotalAmount: params.subtotalAmount,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail ? normalizeIdentifier(params.customerEmail) : undefined,
        paymentProvider: params.paymentProvider,
        paymentReference: params.paymentReference,
        notes: params.notes,
        shippingRecipientName: params.shippingRecipientName,
        shippingPhone: params.shippingPhone,
        shippingProvince: params.shippingProvince,
        shippingCity: params.shippingCity,
        shippingAddressLine1: params.shippingAddressLine1,
        shippingAddressLine2: params.shippingAddressLine2,
        shippingPostalCode: params.shippingPostalCode,
        placedAt: params.placedAt,
        paidAt: params.paidAt,
        failedAt: params.failedAt,
        fulfilledAt: params.fulfilledAt,
        cancelledAt: params.cancelledAt,
        items: {
          create: params.items
        }
      },
      include: {
        items: true
      }
    });
  },

  findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
  },

  listRecentByUserId(userId: string, limit = 5) {
    return prisma.order.findMany({
      where: {
        userId
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    });
  },

  listForAdmin(params?: {
    query?: string;
    status?: string;
    limit?: number;
  }) {
    const normalizedQuery = params?.query?.trim();

    return prisma.order.findMany({
      where: {
        status: params?.status || undefined,
        OR: normalizedQuery
          ? [
              {
                orderNumber: {
                  contains: normalizedQuery
                }
              },
              {
                customerName: {
                  contains: normalizedQuery
                }
              },
              {
                customerPhone: {
                  contains: normalizedQuery
                }
              },
              {
                customerEmail: {
                  contains: normalizedQuery.toLowerCase()
                }
              },
              {
                user: {
                  is: {
                    email: {
                      contains: normalizedQuery.toLowerCase()
                    }
                  }
                }
              },
              {
                user: {
                  is: {
                    phone: {
                      contains: normalizedQuery
                    }
                  }
                }
              }
            ]
          : undefined
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: params?.limit || 50
    });
  },

  findByOrderNumberForAdmin(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          include: {
            profile: true,
            _count: {
              select: {
                orders: true,
                supportRequests: true
              }
            }
          }
        },
        items: {
          orderBy: {
            createdAt: "asc"
          }
        },
        address: true,
        supportRequest: true
      }
    });
  },

  updateStatus(params: {
    orderId?: string;
    orderNumber?: string;
    status: string;
    paymentReference?: string | null;
    placedAt?: Date | null;
    paidAt?: Date | null;
    failedAt?: Date | null;
    fulfilledAt?: Date | null;
    cancelledAt?: Date | null;
  }) {
    if (!params.orderId && !params.orderNumber) {
      throw new Error("missing-order-identifier");
    }

    return prisma.order.update({
      where: params.orderId ? { id: params.orderId } : { orderNumber: params.orderNumber as string },
      data: {
        status: params.status,
        paymentReference: params.paymentReference === undefined ? undefined : params.paymentReference,
        placedAt: params.placedAt === undefined ? undefined : params.placedAt,
        paidAt: params.paidAt === undefined ? undefined : params.paidAt,
        failedAt: params.failedAt === undefined ? undefined : params.failedAt,
        fulfilledAt: params.fulfilledAt === undefined ? undefined : params.fulfilledAt,
        cancelledAt: params.cancelledAt === undefined ? undefined : params.cancelledAt
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });
  }
};

export const dbCustomerAddresses = {
  create(params: {
    userId: string;
    recipientName: string;
    phone: string;
    province: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode?: string;
    label?: string;
    isDefault?: boolean;
  }) {
    return prisma.customerAddress.create({
      data: {
        userId: params.userId,
        recipientName: params.recipientName,
        phone: params.phone,
        province: params.province,
        city: params.city,
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,
        postalCode: params.postalCode,
        label: params.label,
        isDefault: params.isDefault || false
      }
    });
  }
};

export const dbAuditLogs = {
  create(params: {
    action: string;
    entityType: string;
    entityId?: string;
    requestId?: string;
    userId?: string;
    details?: string | Record<string, unknown>;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        requestId: params.requestId,
        userId: params.userId,
        details:
          typeof params.details === "string"
            ? params.details
            : params.details
              ? JSON.stringify(params.details)
              : undefined,
        ipAddress: params.ipAddress
      }
    });
  },

  countRecentByActionAndIp(params: {
    action: string;
    ipAddress: string;
    since: Date;
  }) {
    return prisma.auditLog.count({
      where: {
        action: params.action,
        ipAddress: params.ipAddress,
        createdAt: {
          gte: params.since
        }
      }
    });
  }
};

export const dbAnalyticsEvents = {
  create(params: {
    name: string;
    source?: string;
    route: string;
    path: string;
    requestId?: string;
    userId?: string;
    sessionKind?: string;
    referrerHost?: string;
    entityType?: string;
    entityId?: string;
    metadata?: string | Record<string, unknown>;
  }) {
    return prisma.analyticsEvent.create({
      data: {
        name: params.name,
        source: params.source || "storefront",
        route: params.route,
        path: params.path,
        requestId: params.requestId,
        userId: params.userId,
        sessionKind: params.sessionKind || "guest",
        referrerHost: params.referrerHost,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata:
          typeof params.metadata === "string"
            ? params.metadata
            : params.metadata
              ? JSON.stringify(params.metadata)
              : undefined
      }
    });
  }
};

export const dbSupportRequests = {
  create(params: {
    subject: string;
    message: string;
    userId?: string;
    status?: string;
    channel?: string;
    name?: string;
    email?: string;
    phone?: string;
  }) {
    return prisma.supportRequest.create({
      data: {
        userId: params.userId,
        subject: params.subject,
        message: params.message,
        status: params.status || "open",
        channel: params.channel || "site",
        name: params.name,
        email: params.email ? normalizeIdentifier(params.email) : undefined,
        phone: params.phone
      }
    });
  }
};

export {
  listInternalProducts,
  getInternalProductBySlug,
  listInternalProductCategories,
  createInternalProduct,
  updateInternalProduct,
  toggleInternalProductStatus,
  toggleInternalProductFeatured
} from "@/lib/db/store-products";
