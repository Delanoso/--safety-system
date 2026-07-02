/** Fixed created date shown on all Salus PDF footers. */
export const PDF_CREATED_DATE_LABEL = "April 2025";

/** Review date is always April of the year after the PDF is generated. */
export function getPdfReviewDateLabel(now: Date = new Date()): string {
  return `April ${now.getFullYear() + 1}`;
}

/** Date the PDF file was generated (render/download time). */
export function getPdfGeneratedDateLabel(now: Date = new Date()): string {
  return now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function resolvePdfDocumentNumber(
  entityId?: string | null,
  documentNumber?: string | null
): string {
  if (documentNumber?.trim()) return documentNumber.trim();
  if (entityId?.trim()) return entityId.trim();
  return "—";
}

export type PdfFooterMetadata = {
  documentNumber: string;
  createdDate: string;
  reviewDate: string;
  pdfDate: string;
};

export function getPdfFooterMetadata(options?: {
  entityId?: string | null;
  documentNumber?: string | null;
  now?: Date;
}): PdfFooterMetadata {
  const now = options?.now ?? new Date();
  return {
    documentNumber: resolvePdfDocumentNumber(
      options?.entityId,
      options?.documentNumber
    ),
    createdDate: PDF_CREATED_DATE_LABEL,
    reviewDate: getPdfReviewDateLabel(now),
    pdfDate: getPdfGeneratedDateLabel(now),
  };
}
