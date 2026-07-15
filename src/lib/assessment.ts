import { getConfig, readDb, saveDb, uid } from "./db";
import {
  buildRiskDrivers,
  calculateExposure,
  calculateScore,
  matchUnderwriterRule,
  resolveClimate,
  selectTopRepairs,
} from "./scoring";
import {
  DEMO_VIN,
  FALLBACK_VEHICLE_IMAGE,
  generateReportId,
  validateVin,
  type ManualVehicleInput,
} from "./utils";

export type VehicleSnapshot = {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  engine?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  fuelType?: string | null;
  bodyStyle?: string | null;
  imageUrl?: string | null;
  underwriterClass: number;
  modelAdjustment: number;
  modelAdjReason?: string | null;
  vehicleId?: string;
};

export async function lookupVin(vinRaw: string): Promise<
  | { ok: true; vehicle: VehicleSnapshot }
  | { ok: false; message: string; allowManual: true }
> {
  const check = validateVin(vinRaw);
  if (!check.ok) {
    return { ok: false, message: check.message || "Invalid VIN", allowManual: true };
  }

  const vin = vinRaw.trim().toUpperCase();
  const db = await readDb();
  const vehicle = db.vehicles.find((v) => v.vin === vin);

  if (vehicle) {
    return {
      ok: true,
      vehicle: {
        vin: vehicle.vin,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: vehicle.trim,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        drivetrain: vehicle.drivetrain,
        fuelType: vehicle.fuelType,
        bodyStyle: vehicle.bodyStyle,
        imageUrl: vehicle.imageUrl || FALLBACK_VEHICLE_IMAGE,
        underwriterClass: vehicle.underwriterClass,
        modelAdjustment: vehicle.modelAdjustment,
        modelAdjReason: vehicle.modelAdjReason,
        vehicleId: vehicle.id,
      },
    };
  }

  return {
    ok: false,
    message: "Vehicle information unavailable for this VIN.",
    allowManual: true,
  };
}

export async function createAssessmentPreview(input: {
  vehicle: VehicleSnapshot;
  mileage: number;
  zipCode: string;
}) {
  const db = await readDb();
  const { climate } = resolveClimate(db, input.zipCode);

  let matchedRule: string | null = null;
  let classNum = input.vehicle.underwriterClass;

  const match = matchUnderwriterRule(db, {
    make: input.vehicle.make,
    model: input.vehicle.model,
    drivetrain: input.vehicle.drivetrain || undefined,
    engine: input.vehicle.engine || undefined,
    year: input.vehicle.year,
  });

  if (match && match.classNum > 0) {
    if (input.vehicle.vin !== DEMO_VIN) classNum = match.classNum;
    matchedRule = match.matchedRule;
  } else if (!match) {
    matchedRule = "Unmatched — using catalog underwriter class";
  }

  const breakdown = calculateScore(db, {
    underwriterClass: classNum,
    mileage: input.mileage,
    year: input.vehicle.year,
    climate,
    modelAdj: input.vehicle.modelAdjustment,
    matchedRule,
  });

  const repairs = selectTopRepairs(db, {
    make: input.vehicle.make,
    model: input.vehicle.model,
    year: input.vehicle.year,
    mileage: input.mileage,
  });

  const exposure = calculateExposure(db, breakdown.finalScore, repairs);
  const drivers = buildRiskDrivers(breakdown, input.mileage);
  const reportId = generateReportId();
  const assessmentId = uid();

  db.assessments.push({
    id: assessmentId,
    reportId,
    vin: input.vehicle.vin,
    mileage: input.mileage,
    zipCode: input.zipCode,
    climate,
    year: input.vehicle.year,
    make: input.vehicle.make,
    model: `${input.vehicle.model}${input.vehicle.trim ? ` ${input.vehicle.trim}` : ""}`,
    trim: input.vehicle.trim,
    engine: input.vehicle.engine,
    transmission: input.vehicle.transmission,
    drivetrain: input.vehicle.drivetrain,
    fuelType: input.vehicle.fuelType,
    bodyStyle: input.vehicle.bodyStyle,
    imageUrl: input.vehicle.imageUrl || FALLBACK_VEHICLE_IMAGE,
    underwriterClass: breakdown.underwriterClass,
    baseScore: breakdown.baseScore,
    mileageAdj: breakdown.mileageAdj,
    ageAdj: breakdown.ageAdj,
    climateAdj: breakdown.climateAdj,
    modelAdj: breakdown.modelAdj,
    finalScore: breakdown.finalScore,
    riskLabel: breakdown.riskLabel,
    reliabilityGrade: breakdown.reliabilityGrade,
    exposure12: exposure.exposure12,
    exposure24: exposure.exposure24,
    worstCase: exposure.worstCase,
    matchedRule: breakdown.matchedRule,
    guideVersion: "Omega v1.0",
    scoringVersion: "1.0",
    unlocked: false,
    customerId: null,
    vehicleId: input.vehicle.vehicleId || null,
    createdAt: new Date().toISOString(),
  });

  for (const r of repairs) {
    db.assessmentRepairs.push({
      id: uid(),
      assessmentId,
      rank: r.rank,
      name: r.name,
      category: r.category,
      avgCost: r.avgCost,
      costLow: r.costLow,
      costHigh: r.costHigh,
      mileageLow: r.mileageLow,
      mileageHigh: r.mileageHigh,
      riskLevel: r.riskLevel,
      confidence: r.confidence,
    });
  }

  for (const d of drivers) {
    db.riskDrivers.push({ id: uid(), assessmentId, ...d });
  }

  await saveDb(db);

  return {
    assessmentId,
    reportId,
    score: breakdown.finalScore,
    riskLabel: breakdown.riskLabel,
    reliabilityGrade: breakdown.reliabilityGrade,
    exposure12: exposure.exposure12,
    exposure24: exposure.exposure24,
    climate,
  };
}

export async function createFromManual(input: ManualVehicleInput & { vin?: string }) {
  const db = await readDb();
  const vin = (input.vin || `MANUAL${Date.now()}`.slice(0, 17).padEnd(17, "0")).toUpperCase();

  const match = matchUnderwriterRule(db, {
    make: input.make,
    model: input.model,
    drivetrain: input.drivetrain,
    engine: input.engine,
    year: input.year,
  });

  const classNum = match && match.classNum > 0 ? match.classNum : 5;

  const vehicle: VehicleSnapshot = {
    vin,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim,
    engine: input.engine || "Not specified",
    transmission: input.transmission || "Automatic",
    drivetrain: input.drivetrain || "FWD",
    fuelType: input.fuelType || "Gasoline",
    bodyStyle: input.bodyStyle || "SUV",
    imageUrl: FALLBACK_VEHICLE_IMAGE,
    underwriterClass: classNum,
    modelAdjustment: 0,
  };

  return createAssessmentPreview({
    vehicle,
    mileage: input.mileage,
    zipCode: input.zipCode,
  });
}

export async function captureLead(input: {
  assessmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode?: string;
  consent: boolean;
  ipAddress?: string;
  sourceUrl?: string;
}) {
  if (!input.consent) {
    throw new Error("Consent is required to view your full report.");
  }

  const db = await readDb();
  const assessment = db.assessments.find((a) => a.id === input.assessmentId);
  if (!assessment) throw new Error("Assessment not found. Please start a new review.");

  const consentText =
    getConfig(db, "consent_text") ||
    "I agree to be contacted by My Road Armor.";

  const customerId = uid();
  db.customers.push({
    id: customerId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    zipCode: input.zipCode || assessment.zipCode,
    createdAt: new Date().toISOString(),
  });

  db.leads.push({
    id: uid(),
    assessmentId: assessment.id,
    customerId,
    consentText,
    consentAt: new Date().toISOString(),
    ipAddress: input.ipAddress,
    sourceUrl: input.sourceUrl,
    createdAt: new Date().toISOString(),
  });

  const slug = assessment.reportId.toLowerCase();
  db.reports.push({
    id: uid(),
    assessmentId: assessment.id,
    slug,
    templateVersion: "1.0",
    createdAt: new Date().toISOString(),
  });

  assessment.unlocked = true;
  assessment.customerId = customerId;
  await saveDb(db);

  return getFullReport(assessment.reportId);
}

export async function getFullReport(reportIdOrSlug: string) {
  const db = await readDb();
  const assessment = db.assessments.find(
    (a) =>
      a.reportId === reportIdOrSlug ||
      db.reports.some((r) => r.assessmentId === a.id && r.slug === reportIdOrSlug)
  );
  if (!assessment) return null;

  const repairs = db.assessmentRepairs
    .filter((r) => r.assessmentId === assessment.id)
    .sort((a, b) => a.rank - b.rank);
  const riskDrivers = db.riskDrivers
    .filter((r) => r.assessmentId === assessment.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const report = db.reports.find((r) => r.assessmentId === assessment.id) || null;
  const customer = assessment.customerId
    ? db.customers.find((c) => c.id === assessment.customerId) || null
    : null;
  const lead = db.leads.find((l) => l.assessmentId === assessment.id) || null;

  return {
    ...assessment,
    repairs,
    riskDrivers,
    report,
    customer,
    lead,
  };
}
