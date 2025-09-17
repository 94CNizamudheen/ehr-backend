import { Request, Response } from 'express'
import Patient from '../models/Patients'
import { Types } from 'mongoose'
import Appointments from '../models/Appointments'
import BillingAccount from "../models/Billing";

export async function listPatients(req: Request, res: Response) {
  const q = req.query.q as string | undefined
  const filter = q
    ? { $or: [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { 'contact.phone': new RegExp(q, 'i') },
        { 'contact.email': new RegExp(q, 'i') }
      ]}
    : {}
  const patients = await Patient.find(filter)
  res.json(patients)
}

// GET /patients/:id
export async function getPatient(req: Request, res: Response) {
  const patient = await Patient.findById(req.params.id)
  if (!patient) return res.status(404).json({ error: 'Not found' })
  res.json(patient)
}

export async function createPatient(req: Request, res: Response) {
  const created = await Patient.create(req.body)
  res.status(201).json(created)
}


export async function updatePatient(req: Request, res: Response) {
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
}
export async function deletePatient(req:Request,res:Response){
  console.log('patientid',req.params.id)
  const deleted= await Patient.findByIdAndDelete(req.params.id)
  if(!deleted)return res.status(404).json({ error: 'patient Not found' });
  res.json(deleted)
};
export async function searchPatients(req: Request, res: Response) {
  const q = req.query.q as string | undefined;
  if (!q) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const filter = {
    $or: [
      { firstName: new RegExp(q, "i") },
      { lastName: new RegExp(q, "i") },
      { "contact.phone": new RegExp(q, "i") },
      { "contact.email": new RegExp(q, "i") },
    ],
  };

  const patients = await Patient.find(filter);
  res.json(patients);
}
export async function getPatientHistory(req: Request, res: Response) {
  try {
    const { patientId } = req.params;
    const pid = new Types.ObjectId(patientId);

    const [appointments, account] = await Promise.all([
      Appointments.find({ patient: pid }).sort({ date: -1 }).lean(),
      BillingAccount.findOne({ patientId: pid }).lean(),
    ]);

    const payments = account?.payments ?? [];

    return res.json({
      appointments,
      payments,
    });
  } catch (err) {
    console.error("Error fetching patient history", err);
    res.status(500).json({ error: "Failed to fetch patient history" });
  }
}