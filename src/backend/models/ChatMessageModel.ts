import mongoose, { Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new mongoose.Schema<IChatMessage>(
  {
    userId:  { type: String, required: true, index: true },
    role:    { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ChatMessageModel: Model<IChatMessage> =
  mongoose.models.ChatMessage ??
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessageModel;
