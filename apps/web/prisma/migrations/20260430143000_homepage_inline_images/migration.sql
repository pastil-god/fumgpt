-- Add nullable media field for the homepage inline image editor.
ALTER TABLE "homepage_settings" ADD COLUMN "heroImageUrl" TEXT;
