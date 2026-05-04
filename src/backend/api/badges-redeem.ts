import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import BadgeModel from "@/backend/models/BadgeModel";
import UserModel from "@/backend/models/UserModel";
import { BADGE_DEFS } from "@/frontend/lib/badges";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const { badgeId } = await request.json() as { badgeId: string };

    if (!badgeId) {
      return NextResponse.json({ error: "badgeId is required." }, { status: 400 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const badge = await BadgeModel.findOneAndUpdate(
      { userId: userObjectId, badgeId },
      { $set: { redeemed: true } },
      { new: true }
    );

    if (!badge) {
      return NextResponse.json({ error: "Badge not found." }, { status: 404 });
    }

    const badgeDef = BADGE_DEFS[badgeId];
    let updatedUser = await UserModel.findById(userObjectId).lean();

    if (badgeDef?.unlocksLevel === 2 && updatedUser) {
      updatedUser = await UserModel.findByIdAndUpdate(
        userObjectId,
        { $set: { level: 2 } },
        { new: true }
      ).lean();
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id:            updatedUser._id.toString(),
        name:          updatedUser.name,
        email:         updatedUser.email,
        role:          updatedUser.role,
        classCode:     updatedUser.classCode,
        emailVerified: updatedUser.emailVerified,
        createdAt:     updatedUser.createdAt.toISOString(),
        level:         updatedUser.level ?? 1,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
