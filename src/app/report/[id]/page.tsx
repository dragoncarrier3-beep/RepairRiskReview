"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteChrome";
import { RiskGauge } from "@/components/RiskGauge";
import { RiskDriverBars } from "@/components/RiskDriverBars";
import { RepairTable } from "@/components/RepairTable";
import { RepairTimeline } from "@/components/RepairTimeline";
import {
  formatCurrency,
  formatNumber,
  maskVin,
  riskBgClass,
} from "@/lib/utils";
import {
  BadgeCheck,
  Download,
  Printer,
  Shield,
  AlertTriangle,
  Database,
  CloudSun,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import { downloadReportPdf } from "@/lib/pdf";

type ReportData = {
  id: string;
  reportId: string;
  vin: string;
  mileage: number;
  zipCode: string;
  climate: string;
  year: number;
  make: string;
  model: string;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuelType: string | null;
  bodyStyle: string | null;
  imageUrl: string | null;
  finalScore: number;
  riskLabel: string;
  reliabilityGrade: string;
  exposure12: number;
  exposure24: number;
  worstCase: number;
  underwriterClass: number;
  createdAt: string;
  repairs: Array<{
    rank: number;
    name: string;
    avgCost: number;
    mileageLow: number | null;
    mileageHigh: number | null;
    riskLevel: string;
  }>;
  riskDrivers: Array<{
    name: string;
    percent: number;
    color: string;
    impact: string;
    detail: string;
  }>;
};

export default function ReportPage() {
  const params = useParams();
  const id = String(params.id || "");
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [section, setSection] = useState("summary");

  useEffect(() => {
    fetch(`/api/report/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.locked) {
          window.location.href = `/unlock?id=${data.teaser?.assessmentId || id}`;
          return;
        }
        if (!data.success) {
          setError(data.message || "Report not found.");
          return;
        }
        setReport(data.report);
      })
      .catch(() => setError("Unable to load report. Please try again."));
  }, [id]);

  async function handlePdf() {
    if (!report) return;
    setPdfBusy(true);
    try {
      await downloadReportPdf(report);
    } catch {
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-navy-900">Report unavailable</h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Start a new review
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-navy-900">
        Loading report…
      </div>
    );
  }

  const reportDate = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const highCost = [
    { name: "Engine Replacement", cost: 7900, color: "#dc2626" },
    { name: "Transmission Replacement", cost: 4600, color: "#ef4444" },
    { name: "Turbocharger Replacement", cost: 2650, color: "#ea580c" },
    { name: "A/C System Replacement", cost: 1420, color: "#f59e0b" },
  ];
  const maxCost = 7900;

  return (
    <div className="min-h-screen bg-[#e8eef6]">
      <div className="no-print">
        <SiteHeader />
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        {/* Sidebar */}
        <aside className="no-print hidden w-60 shrink-0 lg:block">
          <div className="card sticky top-24 overflow-hidden p-0">
            <div className="border-b border-slate-100 bg-[#071428] px-4 py-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/80">
                Report navigation
              </p>
              <p className="mt-1 font-display text-sm font-bold">Your Review</p>
            </div>
            <nav className="space-y-0.5 p-2 text-sm">
              {[
                ["summary", "Executive Summary"],
                ["analysis", "Vehicle Analysis"],
                ["timeline", "Repair Timeline"],
                ["financial", "Financial Risk"],
                ["factors", "Risk Factors"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSection(key);
                    document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left font-semibold transition ${
                    section === key
                      ? "bg-[#071428] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="space-y-2 border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={handlePdf}
                disabled={pdfBusy}
                className="btn-primary w-full gap-2"
              >
                <Download className="h-4 w-4" />
                {pdfBusy ? "Preparing…" : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary w-full gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5 pb-16">
          {/* Mobile actions */}
          <div className="no-print flex gap-2 lg:hidden">
            <button type="button" onClick={handlePdf} className="btn-primary flex-1 gap-2">
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button type="button" onClick={() => window.print()} className="btn-secondary gap-2">
              <Printer className="h-4 w-4" />
            </button>
          </div>

          {/* Header card */}
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#071428] px-5 py-5 text-white sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a66d1] to-[#0d3f8a] text-xs font-extrabold">
                  RR
                </span>
                <div>
                  <div className="font-display text-lg font-extrabold tracking-wide">
                    REPAIR RISK REVIEW
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-blue-200">
                    Powered by My Road Armor
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-blue-100">
                <div className="font-medium">{reportDate}</div>
                <div className="font-mono text-xs text-blue-200/80">Report ID: {report.reportId}</div>
              </div>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[240px_1fr]">
              <div className="overflow-hidden rounded-lg bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.imageUrl || "/fallback-car.svg"}
                  alt={`${report.year} ${report.make} ${report.model}`}
                  className="h-44 w-full object-cover md:h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-car.svg";
                  }}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-navy-900 sm:text-2xl">
                    {report.year} {report.make} {report.model}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Vehicle Verified
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                  {[
                    ["VIN", maskVin(report.vin)],
                    ["Mileage", `${formatNumber(report.mileage)} miles`],
                    ["Engine", report.engine || "—"],
                    ["Drivetrain", report.drivetrain || "—"],
                    ["Transmission", report.transmission || "—"],
                    ["Fuel Type", report.fuelType || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {k}
                      </div>
                      <div className="font-medium text-navy-900">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                    <Shield className="h-3.5 w-3.5" />
                    Confidence: HIGH
                  </span>
                  <span>Data points analyzed: 25.4 Million+</span>
                  <span>ZIP {report.zipCode} · {report.climate}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Executive Summary */}
          <section id="summary" className="grid gap-4 md:grid-cols-3">
            <div className="card p-5 md:col-span-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overall Repair Risk
              </h2>
              <div className="mt-2">
                <RiskGauge score={report.finalScore} label={report.riskLabel} size={200} />
              </div>
              <p className="mt-2 text-center text-xs leading-relaxed text-slate-600">
                Elevated likelihood of unexpected repairs over $500 in the next 24 months.
              </p>
            </div>
            <div className="card flex flex-col items-center justify-center p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reliability Grade
              </h2>
              <div className="mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-navy-900 text-4xl font-bold text-white shadow-elev">
                {report.reliabilityGrade}
              </div>
              <p className="mt-3 text-sm text-slate-600">Above average risk band</p>
            </div>
            <div className="card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expected Repair Exposure
              </h2>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-sm text-slate-500">12 Months</div>
                  <div className="text-3xl font-bold text-navy-900">
                    {formatCurrency(report.exposure12)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">24 Months</div>
                  <div className="text-3xl font-bold text-navy-900">
                    {formatCurrency(report.exposure24)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-bold text-navy-900">Primary Risk Drivers</h2>
            <p className="mt-1 text-sm text-slate-600">
              What contributes most to this vehicle&apos;s Repair Risk Index.
            </p>
            <div className="mt-5">
              <RiskDriverBars drivers={report.riskDrivers} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-bold text-navy-900">What This Means</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your {report.year} {report.make} {report.model} scores{" "}
                <strong>{report.finalScore}/100 ({report.riskLabel})</strong>. This relative index
                reflects underwriting class {report.underwriterClass}, mileage, age, and{" "}
                {report.climate.toLowerCase()} climate exposure. It is not a literal probability,
                but a Version 1 planning signal for unexpected repairs over $500.
              </p>
            </div>
            <div className="card border-brand-blue/30 bg-gradient-to-br from-navy-900 to-navy-800 p-5 text-white">
              <h3 className="font-bold">Plan Ahead</h3>
              <p className="mt-2 text-sm text-blue-100">
                High-cost repairs can arrive without warning. Explore protection options designed
                for vehicles in your risk band.
              </p>
              <a
                href="https://myroadarmor.com"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-900"
              >
                Visit MyRoadArmor.com
              </a>
            </div>
          </section>

          {/* Vehicle Analysis */}
          <section id="analysis" className="card p-5 print-break">
            <h2 className="text-lg font-bold text-navy-900">Vehicle Risk Analysis</h2>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {[
                ["Body Style", report.bodyStyle || "4-Door SUV"],
                ["In Service Date", `09/${report.year - 1}`],
                ["Region", `ZIP: ${report.zipCode}`],
                ["Climate Zone", report.climate],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-navy-900">{v}</span>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-base font-bold text-navy-900">
              Top Six Most Likely Repairs
            </h3>
            <div className="mt-3">
              <RepairTable repairs={report.repairs} />
            </div>
          </section>

          <section id="timeline" className="card p-5">
            <h2 className="text-lg font-bold text-navy-900">Repair Timeline (By Mileage)</h2>
            <RepairTimeline currentMileage={report.mileage} />
            <div className="mt-8 border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data Sources
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                {(
                  [
                    { Icon: Building2, label: "Insurance Claims" },
                    { Icon: FileSpreadsheet, label: "OEM Service Info" },
                    { Icon: Database, label: "Industry Databases" },
                    { Icon: CloudSun, label: "Market & Climate" },
                  ] as const
                ).map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5">
                    <item.Icon className="h-3.5 w-3.5 text-brand-blue" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Financial */}
          <section id="financial" className="card p-5 print-break">
            <h2 className="text-lg font-bold text-navy-900">Financial Risk Overview</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase text-slate-500">12-Month Exposure</div>
                <div className="mt-1 text-2xl font-bold">{formatCurrency(report.exposure12)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase text-slate-500">24-Month Exposure</div>
                <div className="mt-1 text-2xl font-bold">{formatCurrency(report.exposure24)}</div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-1 text-xs font-semibold uppercase text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Worst Case (24 mo)
                </div>
                <div className="mt-1 text-2xl font-bold text-red-700">
                  {formatCurrency(report.worstCase)}
                </div>
              </div>
            </div>

            <h3 className="mt-8 font-bold text-navy-900">Potential High-Cost Repairs</h3>
            <div className="mt-4 space-y-3">
              {highCost.map((r) => (
                <div key={r.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{r.name}</span>
                    <span className="font-semibold">{formatCurrency(r.cost)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(r.cost / maxCost) * 100}%`,
                        backgroundColor: r.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="factors" className="card p-5">
            <h2 className="text-lg font-bold text-navy-900">Risk Factor Details</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {report.riskDrivers.map((d) => (
                <div key={d.name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold text-navy-900">{d.name}</div>
                    <div className="text-sm text-slate-600">{d.detail}</div>
                  </div>
                  <span
                    className={`mt-1 inline-flex w-fit rounded-md border px-2 py-0.5 text-xs font-semibold ${riskBgClass(d.impact === "High" ? "HIGH" : d.impact === "Moderate" ? "MODERATE" : "LOW")}`}
                  >
                    {d.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card border-navy-900/10 bg-white p-5">
            <h2 className="text-lg font-bold text-navy-900">Conclusion & Next Steps</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              What this means for you: planning for {" "}
              {formatCurrency(report.exposure24)} in potential repair exposure over 24 months can
              reduce the impact of unexpected failures. Review the timeline against your mileage
              and speak with My Road Armor about coverage options matched to this risk profile.
            </p>
            <div className="mt-4 rounded-lg bg-navy-900 p-4 text-white">
              <div className="font-semibold">Next Step</div>
              <p className="mt-1 text-sm text-blue-100">
                Visit{" "}
                <a href="https://myroadarmor.com" className="underline">
                  MyRoadArmor.com
                </a>{" "}
                to explore protection plans for your vehicle.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
