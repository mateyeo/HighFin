import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/jwt";
import GoalPlanModel from "@/models/GoalPlanModel";

export async function GET(request: Request) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();
    const goal = await GoalPlanModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(goal ?? null);
  } catch (err) {
    console.error("[GET /api/goal]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}

export async function POST(request: Request) {
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

    return NextResponse.json(goal);
  } catch (err) {
    console.error("[POST /api/goal]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
