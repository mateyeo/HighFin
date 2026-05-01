import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import { normalize } from "@/backend/lib/normalize";
import PortfolioModel from "@/backend/models/PortfolioModel";

export async function GET(request: Request) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();
    const portfolio = await PortfolioModel.findOne({ userId }).lean();
    return NextResponse.json(portfolio ? normalize(portfolio) : null);
  } catch (err) {
    console.error("[GET /api/portfolio]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = getAuthUser(request);
    const body = await request.json();

    await connectDB();

    const portfolio = await PortfolioModel.findOneAndUpdate(
      { userId },
      {
        userId,
        allocation:      body.allocation,
        simulationValue: body.simulationValue ?? 0,
        scenarioId:      body.scenarioId ?? "steady",
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(portfolio ? normalize(portfolio) : null);
  } catch (err) {
    console.error("[POST /api/portfolio]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
