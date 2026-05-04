import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/backend/lib/jwt";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
