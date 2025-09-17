import { Request, Response } from "express";
import BillingAccount from "../models/Billing";
import BillingCode from "../models/BillingCode";
import { Types } from "mongoose";

export async function checkInsurance(req: Request, res: Response) {
  const { insurer, policyNumber, patientPhone } = req.body as {
    insurer?: string; policyNumber?: string; patientPhone?: string;
  };

  if (!insurer || !policyNumber) {
    return res.status(400).json({ error: "insurer and policyNumber required" });
  }
  const lastChar = policyNumber.trim().slice(-1);
  const eligible = /[0-9]/.test(lastChar) ? (parseInt(lastChar, 10) % 2 === 0) : false;
  const coveragePercent = eligible ? 0.8 : 0; // 80% covered when eligible

  return res.json({
    insurer,
    policyNumber,
    eligible,
    coveragePercent,
    message: eligible ? "Policy eligible (mock)" : "Policy not eligible (mock)",
  });
}
async function ensureAccount(patientId: string) {
  const pid = new Types.ObjectId(patientId);
  let acct = await BillingAccount.findOne({ patientId: pid });
  if (!acct) {
    acct = await BillingAccount.create({ patientId: pid, balance: 0, charges: [], payments: [] });
  }
  return acct;
}
export async function getAccount(req: Request, res: Response) {
  const { patientId } = req.params;
  const acct = await ensureAccount(patientId);
  return res.json(acct);
}

export async function addCharge(req: Request, res: Response) {
  const patientId = req.params.patientId;
  const { code, description, amount } = req.body as {
    code?: string;
    description?: string;
    amount?: number;
  };
  let resolvedAmount: number | undefined = amount;
  let resolvedDescription: string | undefined = description;
  let resolvedCode: string | undefined = code;

  if (code) {
    const codeDoc = await BillingCode.findOne({ code: code });
    if (!codeDoc) {
      return res.status(404).json({ error: `Billing code ${code} not found` });
    }
    resolvedAmount = codeDoc.amount;
    resolvedDescription = codeDoc.description;
    resolvedCode = codeDoc.code;
  }

  if (typeof resolvedAmount !== "number" || Number.isNaN(resolvedAmount) || resolvedAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number (or supply a valid code)" });
  }
  const pid = new Types.ObjectId(patientId);
  let acct = await BillingAccount.findOne({ patientId: pid });
  if (!acct) {
    acct = await BillingAccount.create({ patientId: pid, balance: 0, charges: [], payments: [] });
  }

  const charge = {
    code: resolvedCode || "manual",
    description: resolvedDescription,
    amount: resolvedAmount,
    date: new Date().toISOString(),
  };

  acct.charges.push(charge);
  acct.balance = (acct.balance || 0) + resolvedAmount;
  await acct.save();

  return res.status(201).json({ balance: acct.balance, charge });
}
export async function addPayment(req: Request, res: Response) {
  const patientId = req.params.patientId;
  const { amount, method, note } = req.body as { amount: number; method: "cash"|"card"|"insurance"|"other"; note?: string };

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const acct = await ensureAccount(patientId);
  const payment = {
    patientId: new Types.ObjectId(patientId),
    amount,
    method,
    note,
    date: new Date().toISOString(),
  };
  acct.payments.push(payment as any);
  acct.balance = (acct.balance || 0) - amount;
  if (acct.balance < 0) acct.balance = 0; 
  await acct.save();
  return res.json({ balance: acct.balance, payment });
}

export async function listPayments(req: Request, res: Response) {
  const patientId = req.params.patientId;
  const acct = await ensureAccount(patientId);
  return res.json(acct.payments || []);
}

export async function listBillingCodes(req: Request, res: Response) {
  const codes = await BillingCode.find().lean();
  res.json(codes);
}
export async function createBillingCode(req: Request, res: Response) {
  const { code, description, amount } = req.body as { code: string; description?: string; amount: number };
  if (!code || typeof amount !== "number") return res.status(400).json({ error: "code and amount required" });
  const bc = await BillingCode.create({ code, description, amount, active: true });
  res.status(201).json(bc);
}

export async function reportSummary(req: Request, res: Response) {
  const { from, to } = req.query as { from?: string; to?: string };
  const matchStage: any = {};

  const accounts = await BillingAccount.find().lean();
  let totalRevenue = 0;
  let totalOutstanding = 0;
  for (const a of accounts) {
    // payments
    for (const p of a.payments || []) {
      const d = new Date(p.date);
      if (from && d < new Date(String(from))) continue;
      if (to && d > new Date(String(to))) continue;
      totalRevenue += p.amount;
    }
    totalOutstanding += (a.balance || 0);
  }
  return res.json({ totalRevenue, totalOutstanding, accountsCount: accounts.length });
};

export async function listAccounts(req:Request, res:Response) {
  const accounts = await BillingAccount.find().lean();
  res.json(accounts);
}
export async function updateBillingCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { code, description, amount, active } = req.body;

    const updated = await BillingCode.findByIdAndUpdate(
      id,
      { code, description, amount, active },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Billing code not found" });
    }

    res.json(updated);
  } catch (err: any) {
    console.error("Error updating billing code:", err);
    res.status(500).json({ error: err.message || "Failed to update billing code" });
  }
}


export async function deleteBillingCode(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const deleted = await BillingCode.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Billing code not found" });
    }

    res.json({ message: "Billing code deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting billing code:", err);
    res.status(500).json({ error: err.message || "Failed to delete billing code" });
  }
};
export async function outstandingPatients(req: Request, res: Response) {
  try {
    const accounts = await BillingAccount.find({ balance: { $gt: 0 } })
      .populate("patientId", "firstName lastName contact")
      .lean();

    const result = accounts.map((a) => ({
      patient: a.patientId, 
      balance: a.balance,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching outstanding patients", err);
    res.status(500).json({ error: "Failed to fetch outstanding patients" });
  }
}