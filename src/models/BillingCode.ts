import mongoose, { Schema, Document } from "mongoose";

export interface BillingCodeDoc extends Document {
  code: string;
  description: string;
  amount: number;
  active: boolean;
}

const BillingCodeSchema = new Schema<BillingCodeDoc>({
  code: { type: String, required: true, unique: true },
  description : String,
  amount: { type: Number, required: true },
  active: { type: Boolean, default: true },
});

export default mongoose.model<BillingCodeDoc>("BillingCode", BillingCodeSchema);
