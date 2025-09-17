import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const user = process.env.MONGO_USER
const password = process.env.MONGO_PASSWORD

const uri = `mongodb+srv://${user}:${password}@cluster0.cbwjjr5.mongodb.net/`

export async function connectDB() {
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error(' MongoDB connection error', err)
    process.exit(1)
  }
}
