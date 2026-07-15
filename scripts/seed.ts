import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import { randomUUID } from "crypto";

const DEMO_VIN = "3GNAXUEV3L6123456";
const EQUINOX_IMAGE =
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80";

type Db = Record<string, unknown[]>;

function uid() {
  return randomUUID();
}

function buildDb() {
  const riskClassMap = [
    { classNum: 1, baseScore: 12, label: "Excellent" },
    { classNum: 2, baseScore: 20, label: "Low" },
    { classNum: 3, baseScore: 30, label: "Low" },
    { classNum: 4, baseScore: 40, label: "Moderate" },
    { classNum: 5, baseScore: 50, label: "Moderate" },
    { classNum: 6, baseScore: 60, label: "High" },
    { classNum: 7, baseScore: 72, label: "High" },
    { classNum: 8, baseScore: 82, label: "Severe" },
    { classNum: 9, baseScore: 92, label: "Severe" },
    { classNum: 10, baseScore: 98, label: "Severe" },
  ];

  const scoreAdjustments = [
    { id: uid(), category: "mileage", minValue: 0, maxValue: 24999, adjustment: -10, label: "0–24,999", key: null },
    { id: uid(), category: "mileage", minValue: 25000, maxValue: 49999, adjustment: -5, label: "25,000–49,999", key: null },
    { id: uid(), category: "mileage", minValue: 50000, maxValue: 74999, adjustment: 0, label: "50,000–74,999", key: null },
    { id: uid(), category: "mileage", minValue: 75000, maxValue: 99999, adjustment: 5, label: "75,000–99,999", key: null },
    { id: uid(), category: "mileage", minValue: 100000, maxValue: 124999, adjustment: 10, label: "100,000–124,999", key: null },
    { id: uid(), category: "mileage", minValue: 125000, maxValue: 149999, adjustment: 15, label: "125,000–149,999", key: null },
    { id: uid(), category: "mileage", minValue: 150000, maxValue: 174999, adjustment: 20, label: "150,000–174,999", key: null },
    { id: uid(), category: "mileage", minValue: 175000, maxValue: 9999999, adjustment: 25, label: "175,000+", key: null },
    { id: uid(), category: "age", minValue: 0, maxValue: 2, adjustment: -5, label: "0–2 years", key: null },
    { id: uid(), category: "age", minValue: 3, maxValue: 5, adjustment: 0, label: "3–5 years", key: null },
    { id: uid(), category: "age", minValue: 6, maxValue: 8, adjustment: 5, label: "6–8 years", key: null },
    { id: uid(), category: "age", minValue: 9, maxValue: 11, adjustment: 10, label: "9–11 years", key: null },
    { id: uid(), category: "age", minValue: 12, maxValue: 15, adjustment: 15, label: "12–15 years", key: null },
    { id: uid(), category: "age", minValue: 16, maxValue: 100, adjustment: 20, label: "16+ years", key: null },
    { id: uid(), category: "climate", minValue: null, maxValue: null, key: "Mild", adjustment: 0, label: "Mild" },
    { id: uid(), category: "climate", minValue: null, maxValue: null, key: "Hot", adjustment: 2, label: "Hot" },
    { id: uid(), category: "climate", minValue: null, maxValue: null, key: "Cold/Snow", adjustment: 3, label: "Cold / Snow" },
    { id: uid(), category: "climate", minValue: null, maxValue: null, key: "Coastal/Salt", adjustment: 4, label: "Coastal / Salt" },
    { id: uid(), category: "climate", minValue: null, maxValue: null, key: "Extreme", adjustment: 5, label: "Extreme" },
  ];

  const climateZones = [
    { id: uid(), zipCode: "48304", zipPrefix: "483", climate: "Cold/Snow", region: "Michigan / Upper Midwest" },
    { id: uid(), zipCode: "85001", zipPrefix: "850", climate: "Hot", region: "Arizona" },
    { id: uid(), zipCode: "33101", zipPrefix: "331", climate: "Hot", region: "South Florida" },
    { id: uid(), zipCode: "98101", zipPrefix: "981", climate: "Mild", region: "Seattle" },
    { id: uid(), zipCode: "02101", zipPrefix: "021", climate: "Cold/Snow", region: "Boston" },
    { id: uid(), zipCode: "77001", zipPrefix: "770", climate: "Hot", region: "Houston" },
    { id: uid(), zipCode: "90210", zipPrefix: "902", climate: "Mild", region: "Los Angeles" },
    { id: uid(), zipCode: "10001", zipPrefix: "100", climate: "Coastal/Salt", region: "New York" },
    { id: uid(), zipCode: "60601", zipPrefix: "606", climate: "Cold/Snow", region: "Chicago" },
  ];

  const repairProfiles = [
    { id: uid(), name: "Water Pump", category: "Engine", avgCost: 980, costLow: 720, costHigh: 1250, mileageLow: 90000, mileageHigh: 120000, defaultRisk: "HIGH", confidence: "High" },
    { id: uid(), name: "Alternator", category: "Electrical", avgCost: 840, costLow: 650, costHigh: 1100, mileageLow: 95000, mileageHigh: 125000, defaultRisk: "HIGH", confidence: "High" },
    { id: uid(), name: "Turbocharger", category: "Engine", avgCost: 2650, costLow: 2100, costHigh: 3400, mileageLow: 110000, mileageHigh: 150000, defaultRisk: "MODERATE", confidence: "Medium" },
    { id: uid(), name: "A/C Compressor", category: "HVAC", avgCost: 1420, costLow: 1100, costHigh: 1850, mileageLow: 100000, mileageHigh: 140000, defaultRisk: "MODERATE", confidence: "Medium" },
    { id: uid(), name: "Starter", category: "Electrical", avgCost: 690, costLow: 480, costHigh: 920, mileageLow: 120000, mileageHigh: 160000, defaultRisk: "LOW", confidence: "Medium" },
    { id: uid(), name: "Wheel Bearings", category: "Suspension/Steering", avgCost: 760, costLow: 550, costHigh: 980, mileageLow: 110000, mileageHigh: 150000, defaultRisk: "LOW", confidence: "Medium" },
    { id: uid(), name: "Transmission Replacement", category: "Transmission/Driveline", avgCost: 4600, costLow: 3800, costHigh: 5800, mileageLow: 140000, mileageHigh: 200000, defaultRisk: "HIGH", confidence: "Medium" },
    { id: uid(), name: "Engine Replacement", category: "Engine", avgCost: 7900, costLow: 6500, costHigh: 9500, mileageLow: 150000, mileageHigh: 250000, defaultRisk: "HIGH", confidence: "Low" },
  ];

  const equinoxRepairs = [
    "Water Pump",
    "Alternator",
    "Turbocharger",
    "A/C Compressor",
    "Starter",
    "Wheel Bearings",
  ];

  const vehicleRepairMaps = equinoxRepairs.map((repairName, i) => ({
    id: uid(),
    make: "Chevrolet",
    modelPattern: "Equinox*",
    yearFrom: 2018,
    yearTo: 2022,
    repairName,
    rank: i + 1,
    riskOverride: null,
  }));

  const vehicles = [
    {
      id: uid(),
      vin: DEMO_VIN,
      year: 2020,
      make: "Chevrolet",
      model: "Equinox",
      trim: "LT 1.5 Turbo",
      engine: "1.5L Turbo I4",
      transmission: "6-Speed Automatic",
      drivetrain: "FWD",
      fuelType: "Gasoline",
      bodyStyle: "4-Door SUV",
      imageUrl: EQUINOX_IMAGE,
      underwriterClass: 6,
      modelAdjustment: -4,
      modelAdjReason: "FWD Equinox LT calibrated relative to class peers for Version 1 demo",
    },
  ];

  let underwriterRules: Array<Record<string, unknown>> = [
    {
      id: uid(),
      guideType: "Used Stated & Powertrain",
      manufacturerScope: "CHEVROLET",
      rulePattern: "EQUINOX* [Front Wheel Drive]",
      yearRule: "*",
      riskClass: "6",
      odometerRule: "*",
      sourceRow: 9999,
      precedence: 50,
    },
  ];

  const guidePath = path.resolve(
    "c:/Users/LIGHT/Downloads/Omega_Class_Guide_Normalized.xlsx"
  );
  if (fs.existsSync(guidePath)) {
    const wb = XLSX.readFile(guidePath);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets["Normalized_Rules"]) as Array<
      Record<string, unknown>
    >;
    underwriterRules = [
      ...underwriterRules,
      ...rows.map((r, idx) => {
        const scope = String(r["Manufacturer Scope"] || "All Makes");
        const pattern = String(r["Rule Pattern"] || "*");
        let precedence = 100;
        if (scope === "All Makes") precedence = 500;
        else if (pattern.trim() === "*") precedence = 400;
        else if (pattern.includes("*") && !pattern.includes("[")) precedence = 200;
        return {
          id: uid(),
          guideType: String(r["Guide Type"] || ""),
          manufacturerScope: scope,
          rulePattern: pattern,
          yearRule: String(r["Year Rule"] || "*"),
          riskClass: String(r["Risk Class"] || "NE"),
          odometerRule: String(r["Odometer Rule"] || "*"),
          sourceRow: Number(r["Source Row"] || idx),
          precedence,
        };
      }),
    ];
  }

  const passwordHash = bcrypt.hashSync("Demo123!", 10);

  const db = {
    vehicles,
    customers: [],
    assessments: [],
    assessmentRepairs: [],
    riskDrivers: [],
    leads: [],
    reports: [],
    riskClassMap,
    scoreAdjustments,
    climateZones,
    repairProfiles,
    vehicleRepairMaps,
    underwriterRules,
    adminUsers: [
      {
        id: uid(),
        email: "admin@repairriskreview.com",
        passwordHash,
        name: "Demo Admin",
      },
    ],
    appConfig: [
      {
        key: "reliability_grades",
        value: JSON.stringify([
          { max: 20, grade: "A+" },
          { max: 35, grade: "A" },
          { max: 45, grade: "A-" },
          { max: 55, grade: "B+" },
          { max: 65, grade: "B" },
          { max: 78, grade: "B-" },
          { max: 85, grade: "C+" },
          { max: 92, grade: "C" },
          { max: 100, grade: "D" },
        ]),
      },
      {
        key: "exposure_multipliers",
        value: JSON.stringify({
          scoreBands: [
            { max: 40, m12: 0.12, m24: 0.28 },
            { max: 60, m12: 0.16, m24: 0.35 },
            { max: 80, m12: 0.21, m24: 0.433 },
            { max: 100, m12: 0.28, m24: 0.55 },
          ],
          worstCaseMultiplier: 1.855,
        }),
      },
      {
        key: "consent_text",
        value:
          "I agree to be contacted by My Road Armor regarding vehicle protection options. I understand this is not a credit check and will not impact my credit score. Consent version 1.0.",
      },
      {
        key: "guide_version",
        value: "Omega Class Guide Normalized v1.0 — July 2026",
      },
    ],
  } as Db;

  return db;
}

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const db = buildDb();
  const out = path.join(dataDir, "db.json");
  fs.writeFileSync(out, JSON.stringify(db, null, 2));
  console.log("Seeded", out);
  console.log(`Underwriter rules: ${(db.underwriterRules as unknown[]).length}`);
  console.log(`Demo VIN: ${DEMO_VIN}`);
  console.log("Admin: admin@repairriskreview.com / Demo123!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
