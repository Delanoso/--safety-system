export const COMPANY_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export function isAllowedCompanyDocument(file: File): boolean {
  const name = file.name.toLowerCase();
  return COMPANY_DOCUMENT_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function companyDocumentMimeType(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}
