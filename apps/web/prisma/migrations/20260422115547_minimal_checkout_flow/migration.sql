/*
  Warnings:

  - Added the required column `customerName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "addressId" TEXT,
    "supportRequestId" TEXT,
    "sourceCartId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'manual',
    "paymentReference" TEXT,
    "subtotalAmount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "shippingRecipientName" TEXT,
    "shippingPhone" TEXT,
    "shippingProvince" TEXT,
    "shippingCity" TEXT,
    "shippingAddressLine1" TEXT,
    "shippingAddressLine2" TEXT,
    "shippingPostalCode" TEXT,
    "placedAt" DATETIME,
    "paidAt" DATETIME,
    "failedAt" DATETIME,
    "fulfilledAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "customer_addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_supportRequestId_fkey" FOREIGN KEY ("supportRequestId") REFERENCES "support_requests" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("addressId", "createdAt", "currency", "id", "notes", "orderNumber", "placedAt", "status", "subtotalAmount", "supportRequestId", "updatedAt", "userId") SELECT "addressId", "createdAt", "currency", "id", "notes", "orderNumber", "placedAt", "status", "subtotalAmount", "supportRequestId", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
