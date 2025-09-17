import { Router } from "express";
import {
  checkInsurance,
  getAccount,
  addCharge,
  addPayment,
  listPayments,
  listBillingCodes,
  createBillingCode,
  reportSummary,
  listAccounts,
  updateBillingCode,
  deleteBillingCode,
  outstandingPatients,
} from "../controllers/billingController";

const router = Router();

router.post("/insurance/check", checkInsurance);
router.get("/accounts", listAccounts)
router.get("/account/:patientId", getAccount);
router.post("/:patientId/charge", addCharge);
router.post("/:patientId/payment", addPayment);
router.get("/payments/:patientId", listPayments);
router.get("/reports/outstanding", outstandingPatients);
router.get("/codes", listBillingCodes);
router.post("/codes", createBillingCode);
router.put("/codes/:id", updateBillingCode);
router.delete("/codes/:id", deleteBillingCode);
router.get("/reports/summary", reportSummary);

export default router;
