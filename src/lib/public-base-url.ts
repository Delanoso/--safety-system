/**
 * Public site URL for outbound links (WhatsApp signatures, vote links, etc.).
 * Prefer NEXT_PUBLIC_BASE_URL; fall back to request host in production.
 */
export function getPublicBaseUrl(req?: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const host = req?.headers.get("host")?.trim();
  if (host) {
    const isLocal =
      host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto =
      !isLocal &&
      (req!.headers.get("x-forwarded-proto") === "https" ||
        req!.headers.get("x-forwarded-ssl") === "on")
        ? "https"
        : "http";
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  throw new Error(
    "NEXT_PUBLIC_BASE_URL must be set to your public site URL (e.g. https://your-domain.com)"
  );
}
