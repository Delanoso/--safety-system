/** Client-side: open a prepared WhatsApp chat link. */
export function openWhatsAppLink(url: string) {
  if (typeof window !== "undefined" && url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
