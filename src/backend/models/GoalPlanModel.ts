import mongoose, { Document, Model } from "mongoose";

export interface IGoalPlan extends Document {
  userId: string;
  goalType: "retirement" | "college" | "house" | "emergency" | "other";
  targetAmount: number;
  timeHorizon: number;
  monthlyContribution: number;
  createdAt: Date;
}

const GoalPlanSchema = new mongoose.Schema<IGoalPlan>(
  {
    userId:              { type: String, required: true, index: true },
    goalType:            { type: String, enum: ["retirement", "college", "house", "emergency", "other"], required: true },
    targetAmount:        { type: Number, required: true },
    timeHorizon:         { type: Number, required: true },
    monthlyContribution: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const GoalPlanModel: Model<IGoalPlan> =
  mongoose.models.GoalPlan ?? mongoose.model<IGoalPlan>("GoalPlan", GoalPlanSchema);

export default GoalPlanModel;
