// src/routes/clinicalRoutes.ts
import { Router } from "express";
import {
  addNote,
  addVitals,
  addLabResult,
  addEncounter,
  replaceMedications,
  replaceAllergies,
  replaceConditions,
  replaceImmunizations,
} from "../controllers/clinicalController";

const router = Router();

router.post("/:id/notes", addNote);
router.post("/:id/vitals", addVitals);
router.post("/:id/labs", addLabResult);
router.post("/:id/encounters", addEncounter);

router.put("/:id/medications", replaceMedications);
router.put("/:id/allergies", replaceAllergies);
router.put("/:id/conditions", replaceConditions);
router.put("/:id/immunizations", replaceImmunizations);

export default router;
