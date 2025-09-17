import mongoose, { Schema, Document } from 'mongoose'

export interface ContactInfo {
  phone: string
  email: string
  address: string
}

export interface PatientDocument extends Document {
  firstName: string
  lastName: string
  dob: string
  gender: 'male' | 'female' | 'other'
  contact: ContactInfo
  allergies: string[]
  conditions: string[]
  medications: string[]
  immunizations: string[]
  notes: any[]
  vitals: any[]
  labs: any[]
  encounters: any[]
}

const PatientSchema = new Schema<PatientDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  contact: {
    phone: String,
    email: String,
    address: String
  },
  allergies: [String],
  conditions: [String],
  medications: [String],
  immunizations: [String],
  notes: [{ type: Object }],
  vitals: [{ type: Object }],
  labs: [{ type: Object }],
  encounters: [{ type: Object }]
})

export default mongoose.model<PatientDocument>('Patient', PatientSchema)
