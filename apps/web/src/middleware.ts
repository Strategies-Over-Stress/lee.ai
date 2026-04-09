import { NextRequest, NextResponse } from "next/server";

// --- Rate Limiting (in-memory, per-IP) ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const MAX_STORE_SIZE = 10000;
const rateLimitStore = new Map<string, RateLimitEntry>();
let requestCounter = 0;

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/assessment": { max: 10, windowMs: 60 * 60 * 1000 },
  "/api/consultation": { max: 5, windowMs: 60 * 60 * 1000 },
};

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  // LRU eviction if store exceeds max size
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    const entries = [...rateLimitStore.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toRemove = entries.slice(0, rateLimitStore.size - MAX_STORE_SIZE);
    for (const [key] of toRemove) rateLimitStore.delete(key);
  }
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; retryAfterSeconds?: number } {
  const config = RATE_LIMITS[path];
  if (!config) return { allowed: true };

  // Cleanup on every request if over capacity, otherwise periodic
  if (rateLimitStore.size >= MAX_STORE_SIZE) {
    cleanupExpiredEntries();
  } else {
    requestCounter++;
    if (requestCounter % 100 === 0) {
      cleanupExpiredEntries();
    }
  }

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    // Reject new entries if still at capacity after cleanup (active abuse)
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

  // Allow server-side requests (no origin, no referer — e.g. curl, server-to-server)
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to POST /api/* routes
  if (request.method === "POST" && pathname.startsWith("/api/")) {
    // CSRF check
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limiting (only for specific routes)
    if (RATE_LIMITS[pathname]) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? request.headers.get("x-real-ip")
        ?? "unknown";
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
