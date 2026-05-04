import { NextRequest, NextResponse } from "next/server";

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

  // Handle CORS preflight for all API routes
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return withCors(new NextResponse(null, { status: 204 }), request);
  }

  // Attach CORS headers to all API responses
  if (pathname.startsWith("/api/")) {
    return withCors(NextResponse.next(), request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
