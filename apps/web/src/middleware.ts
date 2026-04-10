import { NextRequest, NextResponse } from "next/server";

// --- Rate Limiting (in-memory, per-IP — backup for Cloudflare edge rules) ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const MAX_STORE_SIZE = 10000;
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/assessment": { max: 10, windowMs: 60 * 60 * 1000 },
  "/api/consultation": { max: 5, windowMs: 60 * 60 * 1000 },
};

function getClientIp(request: NextRequest): string {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetAt) rateLimitStore.delete(key);
  }
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    const entries = [...rateLimitStore.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (const [key] of entries.slice(0, rateLimitStore.size - MAX_STORE_SIZE)) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; retryAfterSeconds?: number } {
  const config = RATE_LIMITS[path];
  if (!config) return { allowed: true };

  if (rateLimitStore.size >= MAX_STORE_SIZE) {
    cleanupExpiredEntries();
  }

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    if (!entry && rateLimitStore.size >= MAX_STORE_SIZE) {
      return { allowed: false, retryAfterSeconds: 60 };
    }
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count <= config.max) return { allowed: true };
  return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}

// --- CSRF Protection ---

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://notsaas.net",
  "https://www.notsaas.net",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean).map((url) => url!.replace(/\/+$/, "").toLowerCase());

function checkCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    const referer = request.headers.get("referer");
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (!referer && !secFetchSite) return true;
    if (secFetchSite === "same-origin") return true;
    return false;
  }

  const normalizedOrigin = origin.replace(/\/+$/, "").toLowerCase();
  return ALLOWED_ORIGINS.some((allowed) => normalizedOrigin === allowed);
}

// --- Middleware ---
// Primary rate limiting: Cloudflare edge rules
// Backup rate limiting: in-memory (this middleware)
// CSRF: origin validation (this middleware)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && pathname.startsWith("/api/")) {
    // CSRF check
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limiting (backup — CF should catch most abuse)
    if (RATE_LIMITS[pathname]) {
      const ip = getClientIp(request);
      const { allowed, retryAfterSeconds } = checkRateLimit(ip, pathname);

      if (!allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {},
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
