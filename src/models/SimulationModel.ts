import mongoose, { Document, Model } from "mongoose";

export interface ISimulation extends Document {
  userId: string;
  scenarioId: string;
  years: { year: number; value: number; contribution: number; growth: number }[];
  finalValue: number;
  totalContributed: number;
  totalGrowth: number;
  updatedAt: Date;
}

const SimulationSchema = new mongoose.Schema<ISimulation>(
  {
    userId:     { type: String, required: true, index: true },
    scenarioId: { type: String, required: true },
    years: [
      {
        year:         Number,
        value:        Number,
        contribution: Number,
        growth:       Number,
      },
    ],
    finalValue:       { type: Number, required: true },
    totalContributed: { type: Number, required: true },
    totalGrowth:      { type: Number, required: true },
  },
  { timestamps: true }
);

const SimulationModel: Model<ISimulation> =
  mongoose.models.Simulation ?? mongoose.model<ISimulation>("Simulation", SimulationSchema);

export default SimulationModel;
