import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import UserModel from "@/models/UserModel";

export async function POST(request: Request) {
  try {
    const { name, email, role, classCode } = await request.json();

    if (!name?.trim() || !email?.trim() || !role) {
      return NextResponse.json({ error: "name, email, and role are required." }, { status: 400 });
    }

    await connectDB();

    // Find existing user or create a new one
    let user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await UserModel.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        classCode: classCode?.trim() || undefined,
      });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id:        user._id.toString(),
        name:      user.name,
        email:     user.email,
        role:      user.role,
        classCode: user.classCode,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("[POST /api/auth/signin]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
