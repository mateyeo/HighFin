import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { hashPassword, validatePassword } from "@/backend/lib/auth";
import { setSessionCookie } from "@/backend/lib/jwt";
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

    const user = await UserModel.create({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      passwordHash,
      role,
      classCode:     classCode?.trim() || undefined,
      emailVerified: true,
    });

    const payload = {
      userId:        user._id.toString(),
      email:         user.email,
      role:          user.role,
      emailVerified: true,
    };

    const response = NextResponse.json(
      {
        user: {
          id:            user._id.toString(),
          name:          user.name,
          email:         user.email,
          role:          user.role,
          classCode:     user.classCode,
          emailVerified: true,
          createdAt:     user.createdAt.toISOString(),
          level:         1,
        },
      },
      { status: 201 }
    );

    setSessionCookie(response, payload);
    return response;
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
