import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { verifyPassword } from "@/backend/lib/auth";
import { setSessionCookie } from "@/backend/lib/jwt";
import UserModel from "@/backend/models/UserModel";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Select passwordHash explicitly (it has select:false in schema)
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
      .select("+passwordHash");

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before signing in.",
          code:  "EMAIL_NOT_VERIFIED",
          email: user.email,
        },
        { status: 403 }
      );
    }

    const payload = {
      userId:        user._id.toString(),
      email:         user.email,
      role:          user.role,
      emailVerified: true,
    };

    const response = NextResponse.json({
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
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
