
import { Request, Response } from "express";
import Patient from "../models/Patients";

export async function addNote(req: Request, res: Response) {
  const { id } = req.params;
  const { text, author } = req.body;
  const patient = await Patient.findById(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const note = { text, author, date: new Date().toISOString() };
  patient.notes.push(note);
  await patient.save();
  res.json(note);
}

export async function addVitals(req: Request, res: Response) {
  const { id } = req.params;
  const { bp, hr, temp, weight } = req.body;
  const patient = await Patient.findById(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const vital = { bp, hr, temp, weight, date: new Date().toISOString() };
  patient.vitals.push(vital);
  await patient.save();
  res.json(vital);
}

export async function addLabResult(req: Request, res: Response) {
  const { id } = req.params;
  const { testName, result, unit, normalRange } = req.body;
  const patient = await Patient.findById(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const lab = { testName, result, unit, normalRange, date: new Date().toISOString() };
  patient.labs.push(lab);
  await patient.save();
  res.json(lab);
}

export async function addEncounter(req: Request, res: Response) {
  const { id } = req.params;
  const { diagnosis, procedure, notes } = req.body;
  const patient = await Patient.findById(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const encounter = { diagnosis, procedure, notes, date: new Date().toISOString() };
  patient.encounters.push(encounter);
  await patient.save();
  res.json(encounter);
}


export async function replaceMedications(req: Request, res: Response) {
  const { id } = req.params;
  const { medications } = req.body;

  console.log("replaceMedications body:", { medications });

  if (!Array.isArray(medications)) {
    return res.status(400).json({ error: "medications must be an array" });
  }

  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: { medications } },
    { new: true }
  );
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  return res.json(patient.medications);
}

export async function replaceAllergies(req: Request, res: Response) {
  const { id } = req.params;
  const { allergies } = req.body;

  console.log("replaceAllergies body:", { allergies });

  if (!Array.isArray(allergies)) {
    return res.status(400).json({ error: "allergies must be an array" });
  }

  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: { allergies } },
    { new: true }
  );
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  return res.json(patient.allergies);
}


export async function replaceConditions(req: Request, res: Response) {
  const { id } = req.params;
  const { conditions } = req.body;

  console.log("replaceConditions body:", { conditions });

  if (!Array.isArray(conditions)) {
    return res.status(400).json({ error: "conditions must be an array" });
  }

  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: { conditions } },
    { new: true }
  );
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  return res.json(patient.conditions);
}


export async function replaceImmunizations(req: Request, res: Response) {
  const { id } = req.params;
  const { immunizations } = req.body;

  console.log("replaceImmunizations body:", { immunizations });

  if (!Array.isArray(immunizations)) {
    return res.status(400).json({ error: "immunizations must be an array" });
  }

  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: { immunizations } },
    { new: true }
  );
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  return res.json(patient.immunizations);
}
