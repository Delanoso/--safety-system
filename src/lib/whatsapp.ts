/** WhatsApp link helpers — replaces email for outbound links and notifications. */

const DEFAULT_COUNTRY_CODE = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "27").replace(
  /\D/g,
  ""
);

/** Strip to digits; default South Africa (27) when number starts with 0. */
export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0") && digits.length >= 9) {
    return DEFAULT_COUNTRY_CODE + digits.slice(1);
  }
  if (digits.length >= 10) return digits;
  if (digits.length >= 9) return DEFAULT_COUNTRY_CODE + digits;
  return null;
}

export function isValidPhone(phone: string): boolean {
  return normalizePhone(phone) !== null;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new Error("Invalid phone number");
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppDelivery = {
  whatsappUrl: string;
  phone: string;
};

export function prepareWhatsAppDelivery(
  phone: string,
  message: string
): WhatsAppDelivery {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new Error("Invalid phone number");
  }
  return {
    phone: normalized,
    whatsappUrl: buildWhatsAppUrl(phone, message),
  };
}

/** Put a URL on its own line so WhatsApp makes it tappable. */
export function whatsAppLinkLine(url: string, prefix = ""): string {
  const line = url.trim();
  return prefix ? `${prefix}\n\n${line}` : `\n\n${line}`;
}
