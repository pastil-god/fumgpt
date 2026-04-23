-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'storefront',
    "route" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "requestId" TEXT,
    "userId" TEXT,
    "sessionKind" TEXT NOT NULL DEFAULT 'guest',
    "referrerHost" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "analytics_events_name_createdAt_idx" ON "analytics_events"("name", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_path_createdAt_idx" ON "analytics_events"("path", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_requestId_idx" ON "analytics_events"("requestId");

-- CreateIndex
CREATE INDEX "analytics_events_userId_createdAt_idx" ON "analytics_events"("userId", "createdAt");
