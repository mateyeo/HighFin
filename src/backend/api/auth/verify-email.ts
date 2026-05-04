import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { setSessionCookie } from "@/backend/lib/jwt";
import UserModel from "@/backend/models/UserModel";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await UserModel.findOne({
      verificationToken:          token,
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpiresAt");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    user.emailVerified              = true;
    user.verificationToken          = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    const payload = {
      userId:        user._id.toString(),
      email:         user.email,
      role:          user.role,
      emailVerified: true,
    };

    const response = NextResponse.json({
      message: "Email verified successfully.",
      user: {
        id:            user._id.toString(),
        name:          user.name,
        email:         user.email,
        role:          user.role,
        classCode:     user.classCode,
        emailVerified: true,
        createdAt:     user.createdAt.toISOString(),
      },
    });

    setSessionCookie(response, payload);
    return response;
  } catch (err) {
    console.error("[GET /api/auth/verify-email]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
