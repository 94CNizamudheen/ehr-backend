import { Request, Response } from "express";
import Appointment from "../models/Appointments"; 
import Patient from "../models/Patients";
import { Types } from "mongoose";
import BillingCode from "../models/BillingCode";
import BillingAccount from "../models/Billing";

export async function listAppointments(req: Request, res: Response) {
  const { q, date, provider, patient } = req.query;
  const filter: any = {};
  if (date) filter.date = date;
  if (provider) filter.provider = provider;
  if (patient) filter.patient = patient;

  const appointments = await Appointment.find(filter).populate("patient");
  res.json(appointments);
};

export async function getAppointment(req: Request, res: Response) {
  const appt = await Appointment.findById(req.params.id).populate("patient");
  if (!appt) return res.status(404).json({ error: "Not found" });
  res.json(appt);
}


export async function createAppointment(req: Request, res: Response) {
  const { patientId, provider, date, time, reason, billingCode } = req.body;

  if (!patientId || !provider || !date || !time) {
    return res.status(400).json({ error: "phone, provider, date and time are required" });
  }
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ error: "No patient record found for this phone" });
  }
  const conflict = await Appointment.findOne({ provider, date, time });
  if (conflict) {
    return res.status(400).json({ error: "Time slot already booked" });
  }
  const appt = await Appointment.create({
    patient: patient._id,
    provider,
    date,
    time,
    reason,
    status: "scheduled",
  });

  let createdCharge: any = null;
  try {
    if (billingCode) {
      const codeDoc = await BillingCode.findOne({ code: billingCode });
      if (!codeDoc) {
        console.warn(`Billing code ${billingCode} not found`);
      } else {
        const pid = new Types.ObjectId(patient._id as string);
        let acct = await BillingAccount.findOne({ patientId: pid });
        if (!acct) {
          acct = await BillingAccount.create({ patientId: pid, balance: 0, charges: [], payments: [] });
        }

        const charge = {
          code: codeDoc.code,
          description: codeDoc.description,
          amount: codeDoc.amount,
          date: new Date().toISOString(),
        };
        acct.charges.push(charge);
        acct.balance = (acct.balance || 0) + codeDoc.amount;
        await acct.save();
        createdCharge = charge;
      }
    }
  } catch (err) {
    console.error("Error creating billing charge after appointment:", err);
    
  }

  return res.status(201).json({ appointment: appt, charge: createdCharge });
};


export async function updateAppointment(req: Request, res: Response) {
  const updated = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
}

export async function deleteAppointment(req: Request, res: Response) {
  const deleted = await Appointment.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Deleted" });
}
