export const DEMO_VIN = "3GNAXUEV3L6123456";
export const FALLBACK_VEHICLE_IMAGE =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80";

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function maskVin(vin: string): string {
  if (!vin || vin.length < 11) return vin || "*************";
  return `${vin.slice(0, 8)}******${vin.slice(-4)}`;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function validateVin(vin: string): { ok: boolean; message?: string } {
  const cleaned = vin.trim().toUpperCase();
  if (!cleaned) return { ok: false, message: "Please enter a VIN." };
  if (cleaned.length !== 17) {
    return { ok: false, message: "VIN must be exactly 17 characters." };
  }
  if (/[IOQ]/.test(cleaned)) {
    return { ok: false, message: "VIN cannot contain the letters I, O, or Q." };
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
    return { ok: false, message: "VIN contains invalid characters." };
  }
  return { ok: true };
}

export function riskLabelFromScore(score: number): string {
  if (score <= 20) return "Excellent";
  if (score <= 40) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Severe";
}

export function riskColorClass(label: string): string {
  const l = label.toLowerCase();
  if (l === "excellent") return "text-risk-excellent";
  if (l === "low") return "text-risk-low";
  if (l === "moderate") return "text-risk-moderate";
  if (l === "high") return "text-risk-high";
  if (l === "severe") return "text-risk-severe";
  return "text-navy-900";
}

export function riskBgClass(label: string): string {
  const l = label.toLowerCase();
  if (l === "excellent" || l === "low") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (l === "moderate") return "bg-orange-50 text-orange-700 border-orange-200";
  if (l === "high" || l === "severe") return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function generateReportId(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `RRR-${y}-${m}${d}${String(date.getHours()).padStart(2, "0")}-${rand}`;
}

export function vehicleAge(year: number, asOf = new Date()): number {
  return Math.max(0, asOf.getFullYear() - year);
}

export type ManualVehicleInput = {
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  bodyStyle?: string;
  mileage: number;
  zipCode: string;
};
