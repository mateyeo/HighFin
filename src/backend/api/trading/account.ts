import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import TradingAccountModel from "@/backend/models/TradingAccountModel";
import { getMarketPrices } from "@/backend/lib/marketData";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const account = await TradingAccountModel.findOne({ userId: userObjectId }).lean();

    const prices = getMarketPrices();
    const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));

    if (!account) {
      // Return a fresh account without saving to DB yet
      return NextResponse.json({
        cashBalance:    10000,
        positions:      [],
        totalValue:     10000,
        totalGainLoss:  0,
      });
    }

    let positionValue = 0;
    let totalGainLoss = 0;

    const enrichedPositions = account.positions.map((pos) => {
      const currentPrice = priceMap.get(pos.symbol) ?? pos.avgCost;
      const value        = Math.round(pos.shares * currentPrice * 100) / 100;
      const gainLoss     = Math.round((currentPrice - pos.avgCost) * pos.shares * 100) / 100;
      const gainLossPct  = Math.round(((currentPrice - pos.avgCost) / pos.avgCost) * 10000) / 100;

      positionValue += value;
      totalGainLoss += gainLoss;

      return {
        symbol:       pos.symbol,
        name:         pos.name,
        shares:       pos.shares,
        avgCost:      pos.avgCost,
        currentPrice,
        value,
        gainLoss,
        gainLossPct,
      };
    });

    const totalValue = Math.round((account.cashBalance + positionValue) * 100) / 100;

    return NextResponse.json({
      cashBalance:   account.cashBalance,
      positions:     enrichedPositions,
      totalValue,
      totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
