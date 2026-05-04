import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import TradingAccountModel from "@/backend/models/TradingAccountModel";
import TradeHistoryModel from "@/backend/models/TradeHistoryModel";
import BadgeModel from "@/backend/models/BadgeModel";
import { getStockPrice, getStockBySymbol, getMarketPrices } from "@/backend/lib/marketData";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuthUser(request);
    const body = await request.json() as { symbol: string; type: "buy" | "sell"; shares: number };
    const { symbol, type, shares } = body;

    // Validate inputs
    if (!symbol || !type || shares === undefined) {
      return NextResponse.json({ error: "symbol, type, and shares are required." }, { status: 400 });
    }
    if (!["buy", "sell"].includes(type)) {
      return NextResponse.json({ error: "type must be buy or sell." }, { status: 400 });
    }
    if (!Number.isInteger(shares) || shares <= 0) {
      return NextResponse.json({ error: "shares must be a positive integer." }, { status: 400 });
    }

    const stockDef = getStockBySymbol(symbol);
    if (!stockDef) {
      return NextResponse.json({ error: "Unknown stock symbol." }, { status: 400 });
    }

    const price = getStockPrice(symbol);
    const total = Math.round(price * shares * 100) / 100;

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get or create account
    let account = await TradingAccountModel.findOne({ userId: userObjectId });
    if (!account) {
      account = await TradingAccountModel.create({ userId: userObjectId, cashBalance: 10000, positions: [] });
    }

    if (type === "buy") {
      if (account.cashBalance < total) {
        return NextResponse.json({ error: "Insufficient cash balance." }, { status: 400 });
      }

      account.cashBalance = Math.round((account.cashBalance - total) * 100) / 100;

      const existingIdx = account.positions.findIndex((p) => p.symbol === symbol);
      if (existingIdx >= 0) {
        const existing = account.positions[existingIdx];
        const newShares  = existing.shares + shares;
        const newAvgCost = Math.round(((existing.avgCost * existing.shares + price * shares) / newShares) * 100) / 100;
        account.positions[existingIdx].shares  = newShares;
        account.positions[existingIdx].avgCost = newAvgCost;
      } else {
        account.positions.push({ symbol, name: stockDef.name, shares, avgCost: price });
      }
    } else {
      // sell
      const existingIdx = account.positions.findIndex((p) => p.symbol === symbol);
      if (existingIdx < 0) {
        return NextResponse.json({ error: "No position in this stock." }, { status: 400 });
      }
      const existing = account.positions[existingIdx];
      if (existing.shares < shares) {
        return NextResponse.json({ error: "Not enough shares to sell." }, { status: 400 });
      }

      account.cashBalance = Math.round((account.cashBalance + total) * 100) / 100;

      if (existing.shares === shares) {
        account.positions.splice(existingIdx, 1);
      } else {
        account.positions[existingIdx].shares -= shares;
      }
    }

    account.markModified("positions");
    await account.save();

    // Save trade history
    const tradeRecord = await TradeHistoryModel.create({
      userId: userObjectId,
      symbol,
      name:       stockDef.name,
      type,
      shares,
      price,
      total,
      executedAt: new Date(),
    });

    // Badge checks
    const existingTradeCount = await TradeHistoryModel.countDocuments({ userId: userObjectId });
    if (existingTradeCount === 1) {
      // First trade ever
      await BadgeModel.findOneAndUpdate(
        { userId: userObjectId, badgeId: "FIRST_TRADE" },
        { $setOnInsert: { userId: userObjectId, badgeId: "FIRST_TRADE", earnedAt: new Date(), redeemed: false } },
        { upsert: true, new: true }
      );
    }

    if (account.positions.length >= 4) {
      await BadgeModel.findOneAndUpdate(
        { userId: userObjectId, badgeId: "DIVERSIFIED" },
        { $setOnInsert: { userId: userObjectId, badgeId: "DIVERSIFIED", earnedAt: new Date(), redeemed: false } },
        { upsert: true, new: true }
      );
    }

    // Build enriched account response
    const prices   = getMarketPrices();
    const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));

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
      account: {
        cashBalance:   account.cashBalance,
        positions:     enrichedPositions,
        totalValue,
        totalGainLoss: Math.round(totalGainLoss * 100) / 100,
      },
      trade: {
        id:         tradeRecord._id.toString(),
        symbol,
        name:       stockDef.name,
        type,
        shares,
        price,
        total,
        executedAt: tradeRecord.executedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[POST /api/trading/trade]", err);
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
