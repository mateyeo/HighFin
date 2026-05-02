import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { hashPassword, generateVerificationToken, validatePassword } from "@/backend/lib/auth";
import { sendVerificationEmail } from "@/backend/lib/mailer";
import UserModel from "@/backend/models/UserModel";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, classCode } = await request.json();

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json(
        { error: "name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const validRoles = ["student", "teacher", "parent"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    await connectDB();

    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const { token: verificationToken, expiresAt: verificationTokenExpiresAt } =
      generateVerificationToken();

    const user = await UserModel.create({
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      classCode:                  classCode?.trim() || undefined,
      emailVerified:              false,
      verificationToken,
      verificationTokenExpiresAt,
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      {
        message: "Account created. Check your email to verify your address.",
        email: user.email,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
