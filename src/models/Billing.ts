import mongoose, { Schema, Document, Types } from "mongoose";

export interface Charge {
  code: string;
  description?: string;
  amount: number;
  date: string;
}

export interface PaymentDoc {
  patientId: Types.ObjectId;
  amount: number;
  method: "cash" | "card" | "insurance" | "other";
  date: string;
  note?: string;
}

export interface BillingAccountDoc extends Document {
  patientId: Types.ObjectId;
  balance: number;
  charges: Charge[];
  payments: PaymentDoc[];
}

const ChargeSchema = new Schema<Charge>({
  code: String,
  description: String,
  amount: Number,
  date: String,
}, { _id: false });

const PaymentSchema = new Schema<PaymentDoc>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["cash","card","insurance","other"], required: true },
  date: { type: String, required: true },
  note: String,
}, { _id: true });

const BillingAccountSchema = new Schema<BillingAccountDoc>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, unique: true },
  balance: { type: Number, default: 0 },
  charges: [ChargeSchema],
  payments: [PaymentSchema],
});

export default mongoose.model<BillingAccountDoc>("BillingAccount", BillingAccountSchema);
