import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import { normalize } from "@/backend/lib/normalize";
import SimulationModel from "@/backend/models/SimulationModel";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();
    const sim = await SimulationModel.findOne({ userId }).lean();
    return NextResponse.json(sim ? normalize(sim) : null);
  } catch (err) {
    console.error("[GET /api/simulation]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const body = await request.json();

    await connectDB();

    const sim = await SimulationModel.findOneAndUpdate(
      { userId },
      {
        userId,
        scenarioId:       body.scenarioId,
        years:            body.years,
        finalValue:       body.finalValue,
        totalContributed: body.totalContributed,
        totalGrowth:      body.totalGrowth,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(sim ? normalize(sim) : null);
  } catch (err) {
    console.error("[POST /api/simulation]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
