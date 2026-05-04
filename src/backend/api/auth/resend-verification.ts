import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { generateVerificationToken } from "@/backend/lib/auth";
import { sendVerificationEmail } from "@/backend/lib/mailer";
import UserModel from "@/backend/models/UserModel";

const GENERIC_OK = { message: "If that email is registered and unverified, a new link has been sent." };

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "email is required." }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
      .select("+verificationToken +verificationTokenExpiresAt");

    // Return the same message regardless of whether the email exists to
    // prevent email-enumeration attacks.
    if (!user || user.emailVerified) {
      return NextResponse.json(GENERIC_OK);
    }

    const { token, expiresAt } = generateVerificationToken();
    user.verificationToken          = token;
    user.verificationTokenExpiresAt = expiresAt;
    await user.save();

    await sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json(GENERIC_OK);
  } catch (err) {
    console.error("[POST /api/auth/resend-verification]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
