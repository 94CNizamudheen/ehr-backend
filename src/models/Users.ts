import mongoose, { Schema, Document, Types } from 'mongoose'

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string
  passwordHash: string
  role: 'admin' | 'clinician'
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'clinician'], default: 'clinician' }
})

export default mongoose.model<UserDocument>('User', UserSchema)
