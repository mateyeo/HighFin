import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "student" | "teacher" | "parent";
  classCode?: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    role:      { type: String, enum: ["student", "teacher", "parent"], required: true },
    classCode: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default UserModel;
