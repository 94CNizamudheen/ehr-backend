import app from './app'
import { connectDB } from './config/db'
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT 

async function start() {
  await connectDB()
  app.listen(PORT, () => console.log(` EHR backend running at http://localhost:${PORT}`))
}

start()
