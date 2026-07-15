"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteChrome";
import { Check, Loader2 } from "lucide-react";
import { Suspense } from "react";

const STEPS = [
  "Locating vehicle",
  "Decoding VIN",
  "Retrieving vehicle specifications",
  "Analyzing historical claims data",
  "Evaluating repair patterns",
  "Building your Repair Risk Review",
];

function AnalyzeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(8);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");

  const query = useMemo(
    () => ({
      vin: params.get("vin") || "",
      mileage: params.get("mileage") || "112450",
      zip: params.get("zip") || "48304",
      manual: params.get("manual") === "1",
      year: params.get("year") || "",
      make: params.get("make") || "",
      model: params.get("model") || "",
      trim: params.get("trim") || "",
      engine: params.get("engine") || "",
    }),
    [params]
  );

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    const tick = setInterval(() => {
      setProgress((p) => Math.min(92, p + Math.random() * 8 + 3));
      setStepIdx((s) => Math.min(STEPS.length - 1, s + 1));
    }, 550);

    async function run() {
      try {
        // Minimum animation window
        const body = query.manual
          ? {
              manual: true,
              year: Number(query.year),
              make: query.make,
              model: query.model,
              trim: query.trim,
              engine: query.engine,
              mileage: Number(query.mileage),
              zipCode: query.zip,
            }
          : {
              vin: query.vin,
              mileage: Number(query.mileage),
              zipCode: query.zip,
            };

        const res = await fetch("/api/assessment/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        const elapsed = Date.now() - started;
        const wait = Math.max(0, 3200 - elapsed);
        await new Promise((r) => setTimeout(r, wait));

        if (cancelled) return;

        if (!data.success) {
          if (data.allowManual) {
            setError(data.message || "Vehicle information unavailable.");
            clearInterval(tick);
            return;
          }
          setError(data.message || "Unable to complete analysis.");
          clearInterval(tick);
          return;
        }

        clearInterval(tick);
        setProgress(100);
        setStepIdx(STEPS.length - 1);
        sessionStorage.setItem(
          "rrr_preview",
          JSON.stringify({
            assessmentId: data.assessmentId,
            reportId: data.reportId,
            score: data.score,
            riskLabel: data.riskLabel,
            reliabilityGrade: data.reliabilityGrade,
            exposure12: data.exposure12,
            exposure24: data.exposure24,
            climate: data.climate,
            vin: query.vin,
            mileage: query.mileage,
            zip: query.zip,
          })
        );
        router.push(`/unlock?id=${data.assessmentId}`);
      } catch {
        if (!cancelled) {
          setError("We could not complete the analysis. Please try again.");
          clearInterval(tick);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [query, router]);

  return (
    <div className="flex min-h-screen flex-col surface-mesh">
      <SiteHeader compact />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="card w-full border-0 p-8 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] sm:p-10">
          <div className="mx-auto flex h-40 w-40 items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e8eef6" strokeWidth="9" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#1a66d1"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 327} 327`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="text-center">
                <div className="font-display text-3xl font-extrabold text-navy-900">
                  {Math.round(progress)}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Analyzing
                </div>
              </div>
            </div>
          </div>

          <h1 className="mt-2 text-center font-display text-2xl font-extrabold text-navy-900">
            Analyzing your vehicle
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
            Matching underwriting class rules and repair patterns…
          </p>

          <ul className="mt-8 space-y-2.5">
            {STEPS.map((step, i) => {
              const done = i < stepIdx || progress >= 100;
              const active = i === stepIdx && progress < 100;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? "bg-[#e8f0fb]" : ""
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-[#1a66d1] text-white"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : active ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span
                    className={
                      done || active ? "font-semibold text-navy-900" : "font-medium text-slate-400"
                    }
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ul>

          {error && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">{error}</p>
              <p className="mt-1">You can enter vehicle details manually to continue.</p>
              <a href="/" className="btn-primary mt-4 inline-flex">
                Enter vehicle details manually
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-navy-900">
          Loading…
        </div>
      }
    >
      <AnalyzeInner />
    </Suspense>
  );
}
