import mongoose, { Schema, Document, Types } from "mongoose";

export interface AppointmentDocument extends Document {
  patient: Types.ObjectId;
  provider: string;
  date: string;     
  time: string;     
  reason?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
}

const AppointmentSchema = new Schema<AppointmentDocument>({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  provider: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: String,
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "rescheduled"],
    default: "scheduled",
  },
});

export default mongoose.model<AppointmentDocument>(
  "Appointment",
  AppointmentSchema
);
