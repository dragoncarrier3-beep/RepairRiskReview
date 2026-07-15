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
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";

const HERO_CAR =
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80";

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
        <section className="relative overflow-hidden surface-mesh text-white">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[55%] opacity-25"
            style={{
              backgroundImage: `url(${HERO_CAR})`,
              backgroundSize: "cover",
              backgroundPosition: "center right",
              maskImage: "linear-gradient(90deg, transparent, black 35%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, black 35%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
            <div className="animate-fade-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-blue-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                VIN-based repair risk intelligence
              </div>
              <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Know Your Repair Risk.
                <span className="mt-1 block text-blue-200">Plan Ahead.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-blue-100/85 sm:text-lg">
                Get a personalized analysis of your vehicle&apos;s reliability and
                potential repair costs — in under a minute.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "VIN lookup & decode",
                  "Repair risk scoring",
                  "Reliability analysis",
                  "Expected repair exposure",
                  "Vehicle insights",
                  "Downloadable PDF report",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[14px] font-medium text-blue-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-fade-up animate-delay-1 card border-0 p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:p-8">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-display text-lg font-bold text-navy-900">
                  Start your review
                </p>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  Free · No credit impact
                </span>
              </div>
              <p className="mb-5 text-sm text-slate-500">
                Enter your VIN to generate a personalized Repair Risk Review.
              </p>

              <div className="mb-5 flex rounded-xl bg-slate-100/90 p-1">
                <button
                  type="button"
                  onClick={() => setTab("vin")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    tab === "vin"
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Look up by VIN
                </button>
                <button
                  type="button"
                  onClick={() => setTab("manual")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    tab === "manual"
                      ? "bg-white text-navy-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
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
                      className="input font-mono text-[15px] uppercase tracking-[0.08em]"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      placeholder="Enter VIN"
                      maxLength={17}
                      autoComplete="off"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Demo VIN:{" "}
                      <button
                        type="button"
                        className="font-mono font-semibold text-[#1a66d1] hover:underline"
                        onClick={() => setVin(DEMO_VIN)}
                      >
                        {DEMO_VIN}
                      </button>
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
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? "Starting analysis…" : "Generate My Repair Risk Review"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto grid max-w-6xl gap-0 px-4 sm:grid-cols-3 sm:px-6">
            {[
              {
                icon: Car,
                title: "Personalized for your vehicle",
                text: "VIN-based specs, underwriting class rules, and repair profiles.",
              },
              {
                icon: FileBarChart2,
                title: "Powered by millions of data points",
                text: "Insurance claims patterns, OEM service info, and market data.",
              },
              {
                icon: Lock,
                title: "No impact to your credit score",
                text: "Soft informational review — never a credit inquiry.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex gap-4 px-2 py-8 sm:px-5 ${
                  i < 2 ? "sm:border-r sm:border-slate-100" : ""
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0fb] text-[#1a66d1]">
                  <item.icon className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div>
                  <h3 className="font-display text-[15px] font-bold text-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a66d1]">
              Simple process
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Enter your VIN, we decode the vehicle, match Omega underwriting class rules,
              and build a transparent Repair Risk Index with exposure estimates.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Gauge,
                step: "01",
                t: "Identify",
                d: "Decode VIN or confirm Year, Make, Model, and engine.",
              },
              {
                icon: FileBarChart2,
                step: "02",
                t: "Score",
                d: "Apply class, mileage, age, climate, and model adjustments.",
              },
              {
                icon: DollarSign,
                step: "03",
                t: "Estimate",
                d: "Surface likely repairs, timeline, and financial exposure.",
              },
              {
                icon: Shield,
                step: "04",
                t: "Plan",
                d: "Unlock the full report and review next steps with confidence.",
              },
            ].map((s) => (
              <div
                key={s.t}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(7,20,40,0.25)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(7,20,40,0.3)]"
              >
                <span className="font-display text-4xl font-extrabold text-slate-100 transition group-hover:text-blue-50">
                  {s.step}
                </span>
                <div className="mt-[-8px] flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0fb] text-[#1a66d1]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
