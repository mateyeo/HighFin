import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import TradeHistoryModel from "@/backend/models/TradeHistoryModel";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();

    const trades = await TradeHistoryModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ executedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(
      trades.map((t) => ({
        id:         t._id.toString(),
        symbol:     t.symbol,
        name:       t.name,
        type:       t.type,
        shares:     t.shares,
        price:      t.price,
        total:      t.total,
        executedAt: t.executedAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
