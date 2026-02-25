-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "appointee" TEXT NOT NULL,
    "appointer" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_signature',
    "signatureFile" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
