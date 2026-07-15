"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteChrome";
import { RiskGauge } from "@/components/RiskGauge";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

type Preview = {
  assessmentId: string;
  reportId: string;
  score: number;
  riskLabel: string;
  reliabilityGrade: string;
  exposure12: number;
  exposure24: number;
  climate?: string;
};

function UnlockInner() {
  const params = useSearchParams();
  const router = useRouter();
  const assessmentId = params.get("id") || "";

  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zipCode: "48304",
    consent: false,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("rrr_preview");
    if (raw) {
      const parsed = JSON.parse(raw) as Preview;
      if (!assessmentId || parsed.assessmentId === assessmentId) {
        setPreview(parsed);
        return;
      }
    }
    if (assessmentId) {
      fetch(`/api/report/${assessmentId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.locked && data.teaser) {
            setPreview({
              assessmentId: data.teaser.assessmentId,
              reportId: "",
              score: data.teaser.score,
              riskLabel: data.teaser.riskLabel,
              reliabilityGrade: data.teaser.reliabilityGrade,
              exposure12: 0,
              exposure24: data.teaser.exposure24,
            });
          } else if (data.success) {
            router.push(`/report/${data.report.reportId}`);
          }
        })
        .catch(() => setError("Unable to load your preview. Please start a new review."));
    }
  }, [assessmentId, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!preview?.assessmentId && !assessmentId) {
      setError("Missing assessment. Please generate a new review.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: preview?.assessmentId || assessmentId,
          ...form,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Unable to save your information.");
        setSubmitting(false);
        return;
      }
      sessionStorage.removeItem("rrr_preview");
      router.push(`/report/${data.reportId}`);
    } catch {
      setError("Unable to save your information. Please try again.");
      setSubmitting(false);
    }
  }

  if (!preview) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-mesh text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-4 text-sm text-blue-100">Loading your score preview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8eef6]">
      <SiteHeader compact />
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 text-sm text-slate-500 sm:px-6">
          <span className="font-semibold text-navy-900">Step 3 of 3</span>
          <span className="text-slate-300">·</span>
          <span>Unlock your complete Repair Risk Review</span>
        </div>
      </div>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2 lg:items-stretch lg:gap-8 lg:py-12 sm:px-6">
        <div className="card flex flex-col overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-5 sm:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a66d1]">
              Score preview
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy-900 sm:text-[1.75rem]">
              Unlock your complete report
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              High risk vehicles are more likely to experience major repair costs over the next
              24 months.
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center px-6 py-8 sm:px-8">
            <div className="w-full rounded-2xl bg-[#f7f9fc] px-4 py-6">
              <RiskGauge score={preview.score} label={preview.riskLabel} size={240} />
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Reliability Grade
                </div>
                <div className="mt-2 font-display text-4xl font-extrabold text-navy-900">
                  {preview.reliabilityGrade}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  24-Month Exposure
                </div>
                <div className="mt-2 font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
                  {formatCurrency(preview.exposure24)}
                </div>
              </div>
            </div>

            {preview.exposure12 > 0 && (
              <p className="mt-4 text-center text-sm text-slate-500">
                12-month estimate:{" "}
                <span className="font-bold text-navy-900">
                  {formatCurrency(preview.exposure12)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="card flex flex-col p-6 sm:p-8">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-900">
                View my complete report
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                Enter your contact details to unlock the full Repair Risk Review.
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 sm:inline-flex">
              <Lock className="h-3 w-3" />
              Secure
            </span>
          </div>

          <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">First name</label>
                <input
                  className="input"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Last name</label>
                <input
                  className="input"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input
                className="input"
                required
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">ZIP code</label>
              <input
                className="input"
                maxLength={5}
                value={form.zipCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, zipCode: e.target.value.replace(/[^\d]/g, "") }))
                }
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] leading-relaxed text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1a66d1]"
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              />
              <span>
                I agree to be contacted by My Road Armor regarding vehicle protection options.
                This is not a credit check and will not impact my credit score.
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-auto pt-2">
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? "Unlocking…" : "View My Complete Report"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Your information is used only to deliver this report
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-navy-900">Loading…</div>
      }
    >
      <UnlockInner />
    </Suspense>
  );
}
