import mongoose, { Document, Model } from "mongoose";

export interface IPosition {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
}

export interface ITradingAccount extends Document {
  userId: mongoose.Types.ObjectId;
  cashBalance: number;
  positions: IPosition[];
}

const PositionSchema = new mongoose.Schema<IPosition>(
  {
    symbol:  { type: String, required: true },
    name:    { type: String, required: true },
    shares:  { type: Number, required: true },
    avgCost: { type: Number, required: true },
  },
  { _id: false }
);

const TradingAccountSchema = new mongoose.Schema<ITradingAccount>({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  cashBalance: { type: Number, default: 10000 },
  positions:   { type: [PositionSchema], default: [] },
});

const TradingAccountModel: Model<ITradingAccount> =
  mongoose.models.TradingAccount ??
  mongoose.model<ITradingAccount>("TradingAccount", TradingAccountSchema);

export default TradingAccountModel;
