import mongoose, { Document, Model } from "mongoose";

export interface IWatchlistItem extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  name: string;
  sector: string;
  addedAt: Date;
}

const WatchlistSchema = new mongoose.Schema<IWatchlistItem>({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol:  { type: String, required: true },
  name:    { type: String, required: true },
  sector:  { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const WatchlistModel: Model<IWatchlistItem> =
  mongoose.models.WatchlistItem ??
  mongoose.model<IWatchlistItem>("WatchlistItem", WatchlistSchema);

export default WatchlistModel;
