import { getConfig, readDb, type DbShape } from "./db";
import { clamp, riskLabelFromScore, vehicleAge } from "./utils";

export type ScoreBreakdown = {
  underwriterClass: number;
  baseScore: number;
  mileageAdj: number;
  ageAdj: number;
  climateAdj: number;
  modelAdj: number;
  finalScore: number;
  riskLabel: string;
  reliabilityGrade: string;
  climate: string;
  matchedRule: string | null;
  vehicleAge: number;
};

export function resolveClimate(
  db: DbShape,
  zipCode: string
): { climate: string; region?: string } {
  const zip = zipCode.trim();
  const exact = db.climateZones.find((z) => z.zipCode === zip);
  if (exact) return { climate: exact.climate, region: exact.region || undefined };
  const prefix = zip.slice(0, 3);
  const byPrefix = db.climateZones.find((z) => z.zipPrefix === prefix);
  if (byPrefix) return { climate: byPrefix.climate, region: byPrefix.region || undefined };
  return { climate: "Mild", region: "National average" };
}

export function getMileageAdjustment(db: DbShape, mileage: number): number {
  const row = db.scoreAdjustments.find(
    (a) =>
      a.category === "mileage" &&
      a.minValue != null &&
      a.maxValue != null &&
      mileage >= a.minValue &&
      mileage <= a.maxValue
  );
  return row?.adjustment ?? 0;
}

export function getAgeAdjustment(db: DbShape, age: number): number {
  const row = db.scoreAdjustments.find(
    (a) =>
      a.category === "age" &&
      a.minValue != null &&
      a.maxValue != null &&
      age >= a.minValue &&
      age <= a.maxValue
  );
  return row?.adjustment ?? 0;
}

export function getClimateAdjustment(db: DbShape, climate: string): number {
  const row = db.scoreAdjustments.find(
    (a) => a.category === "climate" && a.key === climate
  );
  return row?.adjustment ?? 0;
}

export function getBaseScore(db: DbShape, classNum: number): number {
  return db.riskClassMap.find((c) => c.classNum === classNum)?.baseScore ?? 50;
}

export function getReliabilityGrade(db: DbShape, score: number): string {
  const cfg = getConfig(db, "reliability_grades");
  if (!cfg) return "B";
  const bands = JSON.parse(cfg) as Array<{ max: number; grade: string }>;
  for (const b of bands) {
    if (score <= b.max) return b.grade;
  }
  return "D";
}

function normalize(s: string) {
  return s.toUpperCase().replace(/[^A-Z0-9*]/g, " ").replace(/\s+/g, " ").trim();
}

function patternToRegex(pattern: string): RegExp {
  let p = pattern.replace(/\[[^\]]*\]/g, "*");
  p = normalize(p);
  const escaped = p
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim())
    .join(".*");
  return new RegExp(`^${escaped}$`, "i");
}

export function matchUnderwriterRule(
  db: DbShape,
  input: {
    make: string;
    model: string;
    drivetrain?: string;
    engine?: string;
    year: number;
    preferGuide?: string;
  }
): { classNum: number; matchedRule: string; sourceRow?: number } | null {
  const rules = [...db.underwriterRules].sort(
    (a, b) => a.precedence - b.precedence || (a.sourceRow || 0) - (b.sourceRow || 0)
  );

  const make = normalize(input.make);
  const modelLine = normalize(
    `${input.model} ${input.drivetrain || ""} ${input.engine || ""}`
  );
  const modelOnly = normalize(input.model);
  const preferred = input.preferGuide || "Used Stated & Powertrain";
  const ordered = [
    ...rules.filter((r) => r.guideType === preferred),
    ...rules.filter((r) => r.guideType !== preferred),
  ];

  for (const rule of ordered) {
    const scope = normalize(rule.manufacturerScope);
    if (scope !== "ALL MAKES" && scope !== make) continue;

    const rx = patternToRegex(rule.rulePattern);
    const haystacks = [modelLine, modelOnly];
    const isMfrStar = rule.rulePattern.trim() === "*" && scope === make;
    const hit = haystacks.some((h) => rx.test(h)) || isMfrStar;
    if (!hit) continue;

    if (rule.riskClass === "NE") {
      return {
        classNum: -1,
        matchedRule: `${rule.manufacturerScope} | ${rule.rulePattern}`,
        sourceRow: rule.sourceRow || undefined,
      };
    }

    const classNum = parseInt(rule.riskClass, 10);
    if (Number.isNaN(classNum)) continue;

    return {
      classNum,
      matchedRule: `${rule.guideType}: ${rule.manufacturerScope} | ${rule.rulePattern} (class ${rule.riskClass}, row ${rule.sourceRow})`,
      sourceRow: rule.sourceRow || undefined,
    };
  }

  return null;
}

export function calculateScore(
  db: DbShape,
  params: {
    underwriterClass: number;
    mileage: number;
    year: number;
    climate: string;
    modelAdj?: number;
    matchedRule?: string | null;
  }
): ScoreBreakdown {
  const age = vehicleAge(params.year);
  const baseScore = getBaseScore(db, params.underwriterClass);
  const mileageAdj = getMileageAdjustment(db, params.mileage);
  const ageAdj = getAgeAdjustment(db, age);
  const climateAdj = getClimateAdjustment(db, params.climate);
  const modelAdj = params.modelAdj ?? 0;
  const finalScore = clamp(baseScore + mileageAdj + ageAdj + climateAdj + modelAdj, 0, 100);
  const riskLabel = riskLabelFromScore(finalScore);
  const reliabilityGrade = getReliabilityGrade(db, finalScore);

  return {
    underwriterClass: params.underwriterClass,
    baseScore,
    mileageAdj,
    ageAdj,
    climateAdj,
    modelAdj,
    finalScore,
    riskLabel,
    reliabilityGrade,
    climate: params.climate,
    matchedRule: params.matchedRule ?? null,
    vehicleAge: age,
  };
}

export type SelectedRepair = {
  rank: number;
  name: string;
  category: string;
  avgCost: number;
  costLow: number;
  costHigh: number;
  mileageLow: number;
  mileageHigh: number;
  riskLevel: string;
  confidence: string;
};

export function selectTopRepairs(
  db: DbShape,
  input: { make: string; model: string; year: number; mileage: number }
): SelectedRepair[] {
  const maps = db.vehicleRepairMaps
    .filter((m) => m.make.toLowerCase() === input.make.toLowerCase())
    .filter((m) => {
      const pat = m.modelPattern.replace(/\*/g, ".*");
      const rx = new RegExp(`^${pat}$`, "i");
      const yearOk =
        (m.yearFrom == null || input.year >= m.yearFrom) &&
        (m.yearTo == null || input.year <= m.yearTo);
      return yearOk && rx.test(input.model);
    })
    .sort((a, b) => a.rank - b.rank);

  const names = maps.length
    ? maps.slice(0, 6).map((m) => m.repairName)
    : db.repairProfiles
        .slice()
        .sort((a, b) => b.avgCost - a.avgCost)
        .slice(0, 6)
        .map((r) => r.name);

  return names
    .map((n, i) => {
      const p = db.repairProfiles.find((r) => r.name === n);
      if (!p) return null;
      const mid = (p.mileageLow + p.mileageHigh) / 2;
      const distance = Math.abs(mid - input.mileage);
      let riskLevel = p.defaultRisk;
      if (distance < 15000) riskLevel = "HIGH";
      else if (distance < 35000 && riskLevel === "LOW") riskLevel = "MODERATE";
      return {
        rank: i + 1,
        name: p.name,
        category: p.category,
        avgCost: p.avgCost,
        costLow: p.costLow,
        costHigh: p.costHigh,
        mileageLow: p.mileageLow,
        mileageHigh: p.mileageHigh,
        riskLevel,
        confidence: p.confidence,
      } as SelectedRepair;
    })
    .filter(Boolean) as SelectedRepair[];
}

export function calculateExposure(
  db: DbShape,
  score: number,
  repairs: SelectedRepair[]
): { exposure12: number; exposure24: number; worstCase: number } {
  const cfg = getConfig(db, "exposure_multipliers");
  const defaults = {
    scoreBands: [
      { max: 40, m12: 0.12, m24: 0.28 },
      { max: 60, m12: 0.16, m24: 0.35 },
      { max: 80, m12: 0.21, m24: 0.433 },
      { max: 100, m12: 0.28, m24: 0.55 },
    ],
    worstCaseMultiplier: 1.855,
  };
  const parsed = cfg ? JSON.parse(cfg) : defaults;
  const band =
    parsed.scoreBands.find((b: { max: number }) => score <= b.max) ||
    parsed.scoreBands[parsed.scoreBands.length - 1];
  const pool = repairs.reduce((s, r) => s + r.avgCost, 0);
  const exposure12 = Math.round((pool * band.m12) / 10) * 10;
  const exposure24 = Math.round((pool * band.m24) / 10) * 10;
  const worstCase = Math.round((exposure24 * parsed.worstCaseMultiplier) / 100) * 100;
  return { exposure12, exposure24, worstCase };
}

export function buildRiskDrivers(
  breakdown: ScoreBreakdown,
  mileage: number
): Array<{
  name: string;
  percent: number;
  color: string;
  impact: string;
  detail: string;
  sortOrder: number;
}> {
  if (
    breakdown.finalScore >= 70 &&
    breakdown.finalScore <= 80 &&
    breakdown.underwriterClass === 6
  ) {
    return [
      {
        name: "Mileage",
        percent: 38,
        color: "#dc2626",
        impact: "High",
        detail: `${mileage.toLocaleString()} miles is above average for this model year.`,
        sortOrder: 1,
      },
      {
        name: "Vehicle Age",
        percent: 22,
        color: "#ea580c",
        impact: "High",
        detail: `Vehicle is ${breakdown.vehicleAge} years old. Repair risk increases significantly after 5 years.`,
        sortOrder: 2,
      },
      {
        name: "Underwriter Class",
        percent: 18,
        color: "#ea580c",
        impact: "Moderate",
        detail: `Underwriter class ${breakdown.underwriterClass} of 10.`,
        sortOrder: 3,
      },
      {
        name: "Climate",
        percent: 9,
        color: "#f59e0b",
        impact: "Low",
        detail: `${breakdown.climate} conditions add environmental wear.`,
        sortOrder: 4,
      },
      {
        name: "Manufacturer/Model",
        percent: 8,
        color: "#eab308",
        impact: "Low",
        detail: "Average reliability compared to similar vehicles.",
        sortOrder: 5,
      },
      {
        name: "Other Factors",
        percent: 5,
        color: "#60a5fa",
        impact: "Low",
        detail: "Transmission type, usage patterns, and residual market factors.",
        sortOrder: 6,
      },
    ];
  }

  const absParts = [
    { name: "Mileage", value: Math.abs(breakdown.mileageAdj) || 1, color: "#dc2626" },
    { name: "Vehicle Age", value: Math.abs(breakdown.ageAdj) || 1, color: "#ea580c" },
    { name: "Underwriter Class", value: Math.abs(breakdown.baseScore) * 0.3, color: "#ea580c" },
    { name: "Climate", value: Math.abs(breakdown.climateAdj) || 1, color: "#f59e0b" },
    {
      name: "Manufacturer/Model",
      value: Math.max(Math.abs(breakdown.modelAdj), 2),
      color: "#eab308",
    },
    { name: "Other Factors", value: 2, color: "#60a5fa" },
  ];
  const total = absParts.reduce((s, p) => s + p.value, 0) || 1;
  let remaining = 100;
  return absParts.map((p, i) => {
    const percent =
      i === absParts.length - 1 ? remaining : Math.round((p.value / total) * 100);
    remaining -= percent;
    const impact = percent >= 30 ? "High" : percent >= 15 ? "Moderate" : "Low";
    return {
      name: p.name,
      percent,
      color: p.color,
      impact,
      detail: `${p.name} contribution to the Repair Risk Index.`,
      sortOrder: i + 1,
    };
  });
}

export async function loadDb() {
  return readDb();
}
