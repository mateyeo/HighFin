import mongoose, { Document, Model } from "mongoose";

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  earnedAt: Date;
  redeemed: boolean;
}

const BadgeSchema = new mongoose.Schema<IBadge>({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  badgeId:  { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  redeemed: { type: Boolean, default: false },
});

BadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const BadgeModel: Model<IBadge> =
  mongoose.models.Badge ?? mongoose.model<IBadge>("Badge", BadgeSchema);

export default BadgeModel;
