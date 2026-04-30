import mongoose, { Document, Model } from "mongoose";

export interface IPortfolio extends Document {
  userId: string;
  allocation: {
    stocks: number;
    bonds: number;
    mutualFunds: number;
    indexFunds: number;
  };
  simulationValue: number;
  scenarioId: string;
  updatedAt: Date;
}

const PortfolioSchema = new mongoose.Schema<IPortfolio>(
  {
    userId: { type: String, required: true, index: true },
    allocation: {
      stocks:      { type: Number, required: true },
      bonds:       { type: Number, required: true },
      mutualFunds: { type: Number, required: true },
      indexFunds:  { type: Number, required: true },
    },
    simulationValue: { type: Number, default: 0 },
    scenarioId:      { type: String, default: "steady" },
  },
  { timestamps: true }
);

const PortfolioModel: Model<IPortfolio> =
  mongoose.models.Portfolio ?? mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);

export default PortfolioModel;
