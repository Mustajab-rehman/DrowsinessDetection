import mongoose, { Schema, model, Document } from "mongoose";

interface DrowsinessDoc extends Document {
  ear: number;
  yawn: number;
  timestamp: Date;
}

const drowsinessSchema = new Schema<DrowsinessDoc>(
  {
    ear: { type: Number, required: true },
    yawn: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Drowsiness = model<DrowsinessDoc>("Drowsiness", drowsinessSchema);
