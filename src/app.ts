import express from 'express'
import bodyParser from 'body-parser'
import patientRoutes from './routes/patientsRoutes'
import appointmentRoutes from './routes/appointmentRoutes'
import clinicalRoutes from './routes/clinicalRoutes'
import billingRoutes from './routes/billingRoutes'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const frontendUrl= process.env.FRONTEND_URL

console.log("frontend url",frontendUrl)
const app = express()
app.use(cors({
    origin:frontendUrl,
    credentials:true
}))
app.use(bodyParser.json())
app.use('/patients', patientRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/clinical', clinicalRoutes)
app.use('/billing', billingRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
