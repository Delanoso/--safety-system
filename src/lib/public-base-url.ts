/**
 * Public site URL for outbound links (WhatsApp signatures, vote links, etc.).
 * Prefer SITE_URL (runtime server env) so production domain works without rebuild.
 */
export function getPublicBaseUrl(req?: Request): string {
  const runtimeUrl =
    process.env.SITE_URL?.trim() || process.env.PUBLIC_BASE_URL?.trim();
  if (runtimeUrl) return runtimeUrl.replace(/\/$/, "");

  const envUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const forwardedHost = req?.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req?.headers.get("host")?.trim();
  if (host) {
    const hostname = host.split(":")[0];
    const isLocal =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
    const proto =
      !isLocal &&
      !isIp &&
      (req!.headers.get("x-forwarded-proto") === "https" ||
        req!.headers.get("x-forwarded-ssl") === "on")
        ? "https"
        : isIp
          ? "http"
          : "https";
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  throw new Error(
    "SITE_URL or NEXT_PUBLIC_BASE_URL must be set (e.g. https://onlinesafetysolutions.co.za)"
  );
}
