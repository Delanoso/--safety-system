-- Add optional ID document (image/PDF URL) for company people
ALTER TABLE "CompanyPerson" ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT;
