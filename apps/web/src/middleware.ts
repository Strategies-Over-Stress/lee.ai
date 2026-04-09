import { NextRequest, NextResponse } from "next/server";

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
// Rate limiting handled by Nginx (proxy layer) — see server config

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF check on POST /api/* routes
  if (request.method === "POST" && pathname.startsWith("/api/")) {
    if (!checkCsrf(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
