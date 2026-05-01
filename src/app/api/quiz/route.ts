import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import { normalize } from "@/backend/lib/normalize";
import QuizResultModel from "@/backend/models/QuizResultModel";

export async function GET(request: Request) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();
    const result = await QuizResultModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(result ? normalize(result) : null);
  } catch (err) {
    console.error("[GET /api/quiz]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = getAuthUser(request);
    const body = await request.json();

    await connectDB();

    const result = await QuizResultModel.findOneAndUpdate(
      { userId },
      { userId, answers: body.answers, score: body.score, riskProfile: body.riskProfile },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(result ? normalize(result) : null);
  } catch (err) {
    console.error("[POST /api/quiz]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
