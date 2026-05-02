import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "teacher" | "parent";
  classCode?: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ["student", "teacher", "parent"], required: true },
    classCode:    { type: String, trim: true },
    emailVerified:              { type: Boolean, default: false },
    verificationToken:          { type: String, select: false },
    verificationTokenExpiresAt: { type: Date,   select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default UserModel;
