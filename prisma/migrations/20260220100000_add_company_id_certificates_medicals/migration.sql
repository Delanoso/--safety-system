-- AlterTable: Certificates and Medicals for company scoping
ALTER TABLE "Certificate" ADD COLUMN "companyId" TEXT;
ALTER TABLE "Medical" ADD COLUMN "companyId" TEXT;

-- Add foreign keys
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Medical" ADD CONSTRAINT "Medical_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
