-- Add category and comment to incident images for PDF layouts
ALTER TABLE "IncidentImage" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE "IncidentImage" ADD COLUMN IF NOT EXISTS "comment" TEXT;

CREATE INDEX IF NOT EXISTS "IncidentImage_incidentId_idx" ON "IncidentImage"("incidentId");
