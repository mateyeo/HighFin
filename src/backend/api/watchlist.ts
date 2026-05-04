import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import WatchlistModel from "@/backend/models/WatchlistModel";
import BadgeModel from "@/backend/models/BadgeModel";
import { getStockBySymbol } from "@/backend/lib/marketData";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();

    const items = await WatchlistModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ addedAt: -1 })
      .lean();

    return NextResponse.json(
      items.map((item) => ({
        symbol:  item.symbol,
        name:    item.name,
        sector:  item.sector,
        addedAt: item.addedAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const { symbol } = await request.json() as { symbol: string };

    if (!symbol) {
      return NextResponse.json({ error: "symbol is required." }, { status: 400 });
    }

    const stockDef = getStockBySymbol(symbol);
    if (!stockDef) {
      return NextResponse.json({ error: "Unknown stock symbol." }, { status: 400 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existing = await WatchlistModel.findOne({ userId: userObjectId, symbol });
    if (existing) {
      return NextResponse.json({ error: "Stock already in watchlist." }, { status: 409 });
    }

    const item = await WatchlistModel.create({
      userId:  userObjectId,
      symbol:  stockDef.symbol,
      name:    stockDef.name,
      sector:  stockDef.sector,
      addedAt: new Date(),
    });

    // Check if user now has 5+ watchlist items — award MARKET_WATCHER badge
    const count = await WatchlistModel.countDocuments({ userId: userObjectId });
    if (count >= 5) {
      await BadgeModel.findOneAndUpdate(
        { userId: userObjectId, badgeId: "MARKET_WATCHER" },
        { $setOnInsert: { userId: userObjectId, badgeId: "MARKET_WATCHER", earnedAt: new Date(), redeemed: false } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      item: {
        symbol:  item.symbol,
        name:    item.name,
        sector:  item.sector,
        addedAt: item.addedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const { symbol } = await request.json() as { symbol: string };

    if (!symbol) {
      return NextResponse.json({ error: "symbol is required." }, { status: 400 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);
    await WatchlistModel.deleteOne({ userId: userObjectId, symbol });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
