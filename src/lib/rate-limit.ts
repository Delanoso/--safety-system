/**
 * In-memory rate limiter for login and other sensitive endpoints.
 * For multi-instance deployments, use a shared store (e.g. Redis/Upstash).
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const store = new Map<
  string,
  { count: number; windowStart: number }
>();

function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function checkLoginRateLimit(req: Request): { allowed: boolean; remaining: number; resetInMs: number } {
  const id = getClientId(req);
  const now = Date.now();
  let entry = store.get(id);

  if (!entry) {
    entry = { count: 1, windowStart: now };
    store.set(id, entry);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetInMs: WINDOW_MS };
  }

  if (now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 1, windowStart: now };
    store.set(id, entry);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetInMs: WINDOW_MS };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    const resetInMs = Math.max(0, WINDOW_MS - (now - entry.windowStart));
    return { allowed: false, remaining: 0, resetInMs };
  }

  const resetInMs = Math.max(0, WINDOW_MS - (now - entry.windowStart));
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, resetInMs };
}

export function clearLoginRateLimit(req: Request): void {
  store.delete(getClientId(req));
}
