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

export function isPdfDocument(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

export function resolveDocumentName(customName: string, fileName: string): string {
  const trimmed = customName.trim();
  if (!trimmed) return fileName;

  const extMatch = fileName.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0] : "";
  if (!ext) return trimmed;

  if (trimmed.toLowerCase().endsWith(ext.toLowerCase())) return trimmed;
  return `${trimmed}${ext}`;
}

export function contentDispositionFilename(name: string): string {
  const ascii = name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return ascii || "document";
}
