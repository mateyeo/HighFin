import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import BadgeModel from "@/backend/models/BadgeModel";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();

    const badges = await BadgeModel.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();

    return NextResponse.json(
      badges.map((b) => ({
        badgeId:  b.badgeId,
        earnedAt: b.earnedAt.toISOString(),
        redeemed: b.redeemed,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const { badgeId } = await request.json() as { badgeId: string };

    if (!badgeId) {
      return NextResponse.json({ error: "badgeId is required." }, { status: 400 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const existing = await BadgeModel.findOne({ userId: userObjectId, badgeId }).lean();

    if (existing) {
      return NextResponse.json({
        badge: {
          badgeId:  existing.badgeId,
          earnedAt: existing.earnedAt.toISOString(),
          redeemed: existing.redeemed,
        },
      });
    }

    const badge = await BadgeModel.create({ userId: userObjectId, badgeId });

    return NextResponse.json(
      {
        badge: {
          badgeId:  badge.badgeId,
          earnedAt: badge.earnedAt.toISOString(),
          redeemed: badge.redeemed,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
