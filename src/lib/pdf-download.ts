/** Server-generated PDF download (Puppeteer). Use instead of /pdf-renderer preview. */
export function getPdfDownloadUrl(type: string, id: string | number): string {
  return `/api/pdf?type=${encodeURIComponent(type)}&id=${encodeURIComponent(String(id))}`;
}

/** Navigate to the PDF API so the browser saves the file (Content-Disposition: attachment). */
export function downloadPdf(type: string, id: string | number): void {
  window.location.assign(getPdfDownloadUrl(type, id));
}
