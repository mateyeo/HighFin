import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import UserModel from "@/backend/models/UserModel";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      id:            user._id.toString(),
      name:          user.name,
      email:         user.email,
      role:          user.role,
      classCode:     user.classCode,
      emailVerified: user.emailVerified,
      createdAt:     user.createdAt.toISOString(),
      level:         user.level ?? 1,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
