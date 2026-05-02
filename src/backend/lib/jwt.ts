import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "highfin_session";
const EXPIRES_IN  = "30d";
const MAX_AGE     = 30 * 24 * 60 * 60; // 30 days in seconds

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not defined.");
  return s;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret()) as TokenPayload;
}

/** Attach a secure httpOnly session cookie to a NextResponse. */
export function setSessionCookie(response: NextResponse, payload: TokenPayload): void {
  const token = signToken(payload);
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  });
}

/** Remove the session cookie. */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   0,
  });
}

/**
 * Extract and verify the authenticated user from a NextRequest.
 * Prefers the httpOnly session cookie; falls back to Authorization Bearer
 * header so that programmatic API clients continue to work.
 */
export function getAuthUser(request: NextRequest): TokenPayload {
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return verifyToken(cookieToken);

  const auth  = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Missing authorization token.");
  return verifyToken(token);
}
