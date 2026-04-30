import mongoose, { Document, Model } from "mongoose";

export interface IQuizResult extends Document {
  userId: string;
  answers: { questionId: string; value: number }[];
  score: number;
  riskProfile: "conservative" | "balanced" | "growth" | "aggressive";
  createdAt: Date;
}

const QuizResultSchema = new mongoose.Schema<IQuizResult>(
  {
    userId:      { type: String, required: true, index: true },
    answers:     [{ questionId: String, value: Number }],
    score:       { type: Number, required: true },
    riskProfile: { type: String, enum: ["conservative", "balanced", "growth", "aggressive"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const QuizResultModel: Model<IQuizResult> =
  mongoose.models.QuizResult ?? mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);

export default QuizResultModel;
