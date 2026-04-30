CREATE TABLE "store_products" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "shortDescription" TEXT NOT NULL,
  "description" TEXT,
  "priceAmount" INTEGER,
  "comparePriceAmount" INTEGER,
  "priceLabel" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'IRR',
  "badge" TEXT,
  "category" TEXT,
  "imageUrl" TEXT,
  "ctaText" TEXT,
  "ctaHref" TEXT,
  "features" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "source" TEXT NOT NULL DEFAULT 'internal',
  "createdById" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "store_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "store_products_slug_key" ON "store_products"("slug");
CREATE INDEX "store_products_isActive_isFeatured_sortOrder_idx" ON "store_products"("isActive", "isFeatured", "sortOrder");
CREATE INDEX "store_products_category_idx" ON "store_products"("category");
CREATE INDEX "store_products_updatedAt_idx" ON "store_products"("updatedAt");
