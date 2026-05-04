import mongoose, { Document, Model } from "mongoose";

export interface ITradeHistory extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  name: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  executedAt: Date;
}

const TradeHistorySchema = new mongoose.Schema<ITradeHistory>(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol:     { type: String, required: true },
    name:       { type: String, required: true },
    type:       { type: String, enum: ["buy", "sell"], required: true },
    shares:     { type: Number, required: true },
    price:      { type: Number, required: true },
    total:      { type: Number, required: true },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TradeHistoryModel: Model<ITradeHistory> =
  mongoose.models.TradeHistory ??
  mongoose.model<ITradeHistory>("TradeHistory", TradeHistorySchema);

export default TradeHistoryModel;
