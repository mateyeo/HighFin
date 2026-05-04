import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "highfin_session";

const PROTECTED = [
  "/dashboard",
  "/quiz",
  "/goal",
  "/portfolio",
  "/simulation",
  "/results",
  "/teacher",
  "/badges",
  "/trade",
  "/watchlist",
];

// Attach CORS headers to any response so the frontend service can call the backend.
// CORS_ORIGIN is set on the backend Render service to https://highfin.onrender.com
function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get("origin") ?? "";
  const allowed = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  if (origin === allowed || allowed === "*") {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie"
    );
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Handle CORS preflight for all API routes ──────────────────────
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return withCors(new NextResponse(null, { status: 204 }), request);
  }

  // ── Attach CORS headers to all API responses ──────────────────────
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    return withCors(response, request);
  }

  // ── Auth guard for protected pages ────────────────────────────────
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/quiz/:path*",
    "/goal/:path*",
    "/portfolio/:path*",
    "/simulation/:path*",
    "/results/:path*",
    "/teacher/:path*",
    "/badges/:path*",
    "/trade/:path*",
    "/watchlist/:path*",
  ],
};
