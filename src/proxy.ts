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
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
    const { payload } = await jwtVerify(token, secret);

    if (!payload.emailVerified) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Expired or invalid token — clear cookie and redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/quiz/:path*",
    "/goal/:path*",
    "/portfolio/:path*",
    "/simulation/:path*",
    "/results/:path*",
    "/teacher/:path*",
  ],
};
