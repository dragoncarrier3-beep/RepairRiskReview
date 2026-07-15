"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { DEMO_VIN, validateVin } from "@/lib/utils";
import {
  Shield,
  Gauge,
  FileBarChart2,
  DollarSign,
  Car,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"vin" | "manual">("vin");
  const [vin, setVin] = useState(DEMO_VIN);
  const [mileage, setMileage] = useState("112450");
  const [zipCode, setZipCode] = useState("48304");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [manual, setManual] = useState({
    year: "2020",
    make: "Chevrolet",
    model: "Equinox",
    trim: "LT 1.5 Turbo",
    engine: "1.5L Turbo I4",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "vin") {
        const check = validateVin(vin);
        if (!check.ok) {
          setError(check.message || "Invalid VIN");
          setLoading(false);
          return;
        }
        const params = new URLSearchParams({
          vin: vin.trim().toUpperCase(),
          mileage: mileage || "112450",
          zip: zipCode || "48304",
        });
        router.push(`/analyze?${params.toString()}`);
      } else {
        const params = new URLSearchParams({
          manual: "1",
          year: manual.year,
          make: manual.make,
          model: manual.model,
          trim: manual.trim,
          engine: manual.engine,
          mileage: mileage || "112450",
          zip: zipCode || "48304",
        });
        router.push(`/analyze?${params.toString()}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(43,111,209,0.45), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 35%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/90">
                Repair Risk Review
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                Know Your Repair Risk.
                <br />
                Plan Ahead.
              </h1>
              <p className="mt-4 max-w-lg text-base text-blue-100/85 sm:text-lg">
                Get a personalized analysis of your vehicle&apos;s reliability and potential
                repair costs.
              </p>
              <ul className="mt-8 grid gap-3 text-sm text-blue-50/90 sm:grid-cols-2">
                {[
                  "VIN lookup",
                  "Repair risk scoring",
                  "Reliability analysis",
                  "Expected repair exposure",
                  "Vehicle insights",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card border-0 p-5 shadow-elev sm:p-7">
              <div className="mb-5 flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTab("vin")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    tab === "vin" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Look up by VIN
                </button>
                <button
                  type="button"
                  onClick={() => setTab("manual")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    tab === "manual" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Enter vehicle details
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {tab === "vin" ? (
                  <div>
                    <label className="label" htmlFor="vin">
                      17-digit VIN
                    </label>
                    <input
                      id="vin"
                      className="input font-mono uppercase tracking-wide"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      placeholder="Enter VIN"
                      maxLength={17}
                      autoComplete="off"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Example: {DEMO_VIN}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["year", "Year"],
                        ["make", "Make"],
                        ["model", "Model"],
                        ["trim", "Trim"],
                        ["engine", "Engine"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className={key === "engine" ? "sm:col-span-2" : ""}>
                        <label className="label">{label}</label>
                        <input
                          className="input"
                          value={manual[key]}
                          onChange={(e) =>
                            setManual((m) => ({ ...m, [key]: e.target.value }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="mileage">
                      Current mileage
                    </label>
                    <input
                      id="mileage"
                      className="input"
                      inputMode="numeric"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value.replace(/[^\d]/g, ""))}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="zip">
                      ZIP code
                    </label>
                    <input
                      id="zip"
                      className="input"
                      inputMode="numeric"
                      maxLength={5}
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/[^\d]/g, ""))}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Starting analysis…" : "Generate My Repair Risk Review"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
            {[
              {
                icon: Car,
                title: "Personalized for your vehicle",
                text: "VIN-based specs, class rules, and repair profiles.",
              },
              {
                icon: FileBarChart2,
                title: "Powered by millions of data points",
                text: "Insurance claims patterns, OEM info, and market data.",
              },
              {
                icon: Shield,
                title: "No impact to your credit score",
                text: "Soft informational review — never a credit inquiry.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-brand-blue">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-navy-900">How it works</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Enter your VIN, we decode the vehicle, match Omega underwriting class rules, and
            build a transparent Repair Risk Index with exposure estimates.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Gauge, t: "1. Identify", d: "Decode VIN or confirm Year/Make/Model." },
              { icon: FileBarChart2, t: "2. Score", d: "Apply class, mileage, age, and climate." },
              { icon: DollarSign, t: "3. Estimate", d: "Surface likely repairs and exposure." },
              { icon: Shield, t: "4. Plan", d: "Unlock the full report and next steps." },
            ].map((s) => (
              <div key={s.t} className="card p-5">
                <s.icon className="mb-3 h-6 w-6 text-brand-blue" />
                <h3 className="font-semibold text-navy-900">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
