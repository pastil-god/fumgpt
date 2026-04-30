import type { Prisma, StoreProduct } from "@prisma/client";
import {
  normalizeInternalFeaturedFilter,
  normalizeInternalStatusFilter,
  type InternalProductFeaturedFilter,
  type InternalProductMutationInput,
  type InternalProductStatusFilter
} from "@/lib/store-products";
import { prisma } from "@/lib/db/prisma";

type ListInternalProductsParams = {
  query?: string;
  category?: string;
  status?: InternalProductStatusFilter;
  featured?: InternalProductFeaturedFilter;
  includeInactive?: boolean;
  limit?: number;
};

function getInternalProductWhere(params?: ListInternalProductsParams): Prisma.StoreProductWhereInput {
  const query = params?.query?.trim();
  const normalizedStatus = normalizeInternalStatusFilter(params?.status);
  const normalizedFeatured = normalizeInternalFeaturedFilter(params?.featured);
  const where: Prisma.StoreProductWhereInput = {
    category: params?.category?.trim() || undefined
  };

  if (normalizedStatus === "active") {
    where.isActive = true;
  } else if (normalizedStatus === "inactive") {
    where.isActive = false;
  } else if (!params?.includeInactive) {
    where.isActive = true;
  }

  if (normalizedFeatured === "featured") {
    where.isFeatured = true;
  } else if (normalizedFeatured === "not_featured") {
    where.isFeatured = false;
  }

  if (query) {
    where.OR = [
      {
        title: {
          contains: query
        }
      },
      {
        slug: {
          contains: query
        }
      },
      {
        shortDescription: {
          contains: query
        }
      },
      {
        description: {
          contains: query
        }
      },
      {
        badge: {
          contains: query
        }
      }
    ];
  }

  return where;
}

function buildInternalProductWriteData(
  input: InternalProductMutationInput,
  actor: {
    createdById?: string;
    updatedById: string;
  }
): Prisma.StoreProductUncheckedCreateInput {
  return {
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    description: input.description,
    priceAmount: input.priceAmount,
    comparePriceAmount: input.comparePriceAmount,
    priceLabel: input.priceLabel,
    currency: input.currency,
    badge: input.badge,
    category: input.category,
    imageUrl: input.imageUrl,
    ctaText: input.ctaText,
    ctaHref: input.ctaHref,
    features: input.features as Prisma.InputJsonValue,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
    sortOrder: input.sortOrder,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    source: input.source,
    createdById: actor.createdById,
    updatedById: actor.updatedById
  };
}

export async function listInternalProducts(params?: ListInternalProductsParams) {
  if (!process.env.DATABASE_URL) {
    return [] satisfies StoreProduct[];
  }

  return prisma.storeProduct.findMany({
    where: getInternalProductWhere(params),
    orderBy: [
      {
        sortOrder: "desc"
      },
      {
        updatedAt: "desc"
      }
    ],
    take: typeof params?.limit === "number" && params.limit > 0 ? params.limit : undefined
  });
}

export function getInternalProductBySlug(slug: string) {
  return prisma.storeProduct.findUnique({
    where: {
      slug
    }
  });
}

export function listInternalProductCategories() {
  return prisma.storeProduct.findMany({
    where: {
      category: {
        not: null
      }
    },
    select: {
      category: true
    },
    distinct: ["category"],
    orderBy: {
      category: "asc"
    }
  });
}

export function createInternalProduct(params: {
  input: InternalProductMutationInput;
  createdById: string;
}) {
  return prisma.storeProduct.create({
    data: buildInternalProductWriteData(params.input, {
      createdById: params.createdById,
      updatedById: params.createdById
    })
  });
}

export async function updateInternalProduct(params: {
  slug: string;
  input: InternalProductMutationInput;
  updatedById: string;
}) {
  const previous = await prisma.storeProduct.findUnique({
    where: {
      slug: params.slug
    }
  });

  if (!previous) {
    throw new Error("product-not-found");
  }

  const product = await prisma.storeProduct.update({
    where: {
      slug: params.slug
    },
    data: {
      title: params.input.title,
      shortDescription: params.input.shortDescription,
      description: params.input.description,
      priceAmount: params.input.priceAmount,
      comparePriceAmount: params.input.comparePriceAmount,
      priceLabel: params.input.priceLabel,
      currency: params.input.currency,
      badge: params.input.badge,
      category: params.input.category,
      imageUrl: params.input.imageUrl,
      ctaText: params.input.ctaText,
      ctaHref: params.input.ctaHref,
      features: params.input.features as Prisma.InputJsonValue,
      isActive: params.input.isActive,
      isFeatured: params.input.isFeatured,
      sortOrder: params.input.sortOrder,
      seoTitle: params.input.seoTitle,
      seoDescription: params.input.seoDescription,
      source: params.input.source,
      updatedById: params.updatedById
    }
  });

  return {
    previous,
    product
  };
}

export async function toggleInternalProductStatus(params: {
  slug: string;
  isActive: boolean;
  updatedById: string;
}) {
  const previous = await prisma.storeProduct.findUnique({
    where: {
      slug: params.slug
    },
    select: {
      id: true,
      slug: true,
      isActive: true
    }
  });

  if (!previous) {
    throw new Error("product-not-found");
  }

  const product = await prisma.storeProduct.update({
    where: {
      slug: params.slug
    },
    data: {
      isActive: params.isActive,
      updatedById: params.updatedById
    }
  });

  return {
    previous,
    product
  };
}

export async function toggleInternalProductFeatured(params: {
  slug: string;
  isFeatured: boolean;
  updatedById: string;
}) {
  const previous = await prisma.storeProduct.findUnique({
    where: {
      slug: params.slug
    },
    select: {
      id: true,
      slug: true,
      isFeatured: true
    }
  });

  if (!previous) {
    throw new Error("product-not-found");
  }

  const product = await prisma.storeProduct.update({
    where: {
      slug: params.slug
    },
    data: {
      isFeatured: params.isFeatured,
      updatedById: params.updatedById
    }
  });

  return {
    previous,
    product
  };
}
