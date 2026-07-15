"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteChrome";
import { RiskGauge } from "@/components/RiskGauge";
import { formatCurrency } from "@/lib/utils";

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
    // Fallback fetch locked teaser
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-navy-900">
        Loading preview…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SiteHeader compact />
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-2 lg:items-start">
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Score preview
          </p>
          <h1 className="mt-2 text-2xl font-bold text-navy-900">Unlock your complete report</h1>
          <p className="mt-2 text-sm text-slate-600">
            High risk vehicles are more likely to experience major repair costs over the next 24
            months.
          </p>

          <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 p-6">
            <RiskGauge score={preview.score} label={preview.riskLabel} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reliability Grade
              </div>
              <div className="mt-1 text-3xl font-bold text-navy-900">
                {preview.reliabilityGrade}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                24-Month Exposure
              </div>
              <div className="mt-1 text-2xl font-bold text-navy-900">
                {formatCurrency(preview.exposure24)}
              </div>
            </div>
          </div>
          {preview.exposure12 > 0 && (
            <p className="mt-3 text-center text-sm text-slate-600">
              12-month estimate:{" "}
              <span className="font-semibold text-navy-900">
                {formatCurrency(preview.exposure12)}
              </span>
            </p>
          )}
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-navy-900">View my complete report</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter your contact details to unlock the full Repair Risk Review.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              />
              <span>
                I agree to be contacted by My Road Armor regarding vehicle protection options. This
                is not a credit check and will not impact my credit score.
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Unlocking…" : "View My Complete Report"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <UnlockInner />
    </Suspense>
  );
}
