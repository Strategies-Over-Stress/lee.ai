import { NextRequest, NextResponse } from "next/server";

// --- Rate Limiting (in-memory, per-IP) ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

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
}

function checkRateLimit(ip: string, path: string): boolean {
  const config = RATE_LIMITS[path];
  if (!config) return true;

  requestCounter++;
  if (requestCounter % 100 === 0) {
    cleanupExpiredEntries();
  }

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= config.max;
}

// --- CSRF Protection ---

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://notsaas.net",
  "https://www.notsaas.net",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

function checkCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  // Allow server-side requests (no origin, no referer — e.g. curl, server-to-server)
  if (!origin) {
    const referer = request.headers.get("referer");
    const secFetchSite = request.headers.get("sec-fetch-site");
    // Browser requests always have sec-fetch-site; its absence indicates a non-browser context
    if (!referer && !secFetchSite) return true;
    // same-origin browser requests are allowed
    if (secFetchSite === "same-origin") return true;
    return false;
  }

  return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
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

      if (!checkRateLimit(ip, pathname)) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
