import mongoose, { Document, Model } from "mongoose";

export interface IAssignment extends Document {
  teacherId: string;
  title: string;
  description?: string;
  dueDate?: string;
  classCode: string;
  createdAt: Date;
}

const AssignmentSchema = new mongoose.Schema<IAssignment>(
  {
    teacherId:   { type: String, required: true, index: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate:     { type: String },
    classCode:   { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AssignmentModel: Model<IAssignment> =
  mongoose.models.Assignment ?? mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export default AssignmentModel;
