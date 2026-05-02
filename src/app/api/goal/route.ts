import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import { normalize } from "@/backend/lib/normalize";
import GoalPlanModel from "@/backend/models/GoalPlanModel";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();
    const goal = await GoalPlanModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(goal ? normalize(goal) : null);
  } catch (err) {
    console.error("[GET /api/goal]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const body = await request.json();

    await connectDB();

    const goal = await GoalPlanModel.findOneAndUpdate(
      { userId },
      {
        userId,
        goalType:            body.goalType,
        targetAmount:        body.targetAmount,
        timeHorizon:         body.timeHorizon,
        monthlyContribution: body.monthlyContribution,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(goal ? normalize(goal) : null);
  } catch (err) {
    console.error("[POST /api/goal]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
