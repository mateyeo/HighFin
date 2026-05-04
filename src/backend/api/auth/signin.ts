// Legacy endpoint — redirects callers to the new /api/auth/login route.
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/auth/login instead." },
    { status: 410 }
  );
}
