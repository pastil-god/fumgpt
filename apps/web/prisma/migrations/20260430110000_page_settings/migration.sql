CREATE TABLE "page_settings" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "fieldStyles" JSONB,
  "content" JSONB,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "page_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "page_settings_slug_key" ON "page_settings"("slug");
