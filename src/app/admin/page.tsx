"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Car,
  FileText,
  LogOut,
  Settings2,
  Users,
  Wrench,
} from "lucide-react";
import { formatCurrency, formatNumber, riskBgClass } from "@/lib/utils";

type Dash = {
  stats: {
    totalAssessments: number;
    generatedReports: number;
    capturedLeads: number;
    averageRiskScore: number;
    underwriterRules: number;
  };
  recentLeads: Array<{
    id: string;
    createdAt: string;
    customer: { firstName: string; lastName: string; email: string; phone: string };
    assessment: {
      reportId: string;
      finalScore: number;
      riskLabel: string;
      year: number;
      make: string;
      model: string;
      vin: string;
    };
  }>;
  vehicles: Array<{
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    underwriterClass: number;
  }>;
  riskRules: Array<{ classNum: number; baseScore: number; label: string }>;
  adjustments: Array<{
    id: string;
    category: string;
    label: string | null;
    key: string | null;
    adjustment: number;
    minValue: number | null;
    maxValue: number | null;
  }>;
  repairs: Array<{
    id: string;
    name: string;
    category: string;
    avgCost: number;
    defaultRisk: string;
  }>;
};

type Tab = "overview" | "leads" | "vehicles" | "rules" | "repairs";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("admin@repairriskreview.com");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState("");
  const [data, setData] = useState<Dash | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  async function loadDash() {
    const res = await fetch("/api/admin/dashboard");
    if (res.status === 401) {
      setAuthed(false);
      setChecking(false);
      return;
    }
    const json = await res.json();
    if (json.success) {
      setData(json);
      setAuthed(true);
    }
    setChecking(false);
  }

  useEffect(() => {
    loadDash();
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.message || "Login failed");
      return;
    }
    setAuthed(true);
    await loadDash();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setData(null);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-mesh text-white">
        Loading admin…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-mesh px-4">
        <form onSubmit={onLogin} className="card w-full max-w-md border-0 p-8 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] sm:p-10">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a66d1] to-[#0d3f8a] font-display text-sm font-extrabold text-white">
              RR
            </div>
            <div className="font-display text-xl font-extrabold text-navy-900">Admin Console</div>
            <p className="mt-1 text-sm text-slate-500">Repair Risk Review</p>
          </div>
          <div className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
            <p className="text-center text-xs text-slate-400">
              Demo: admin@repairriskreview.com / Demo123!
            </p>
            <Link href="/" className="block text-center text-sm font-semibold text-[#1a66d1]">
              ← Back to site
            </Link>
          </div>
        </form>
      </div>
    );
  }

  const tabs: Array<{ key: Tab; label: string; icon: typeof BarChart3 }> = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "leads", label: "Leads", icon: Users },
    { key: "vehicles", label: "Vehicles", icon: Car },
    { key: "rules", label: "Risk Rules", icon: Settings2 },
    { key: "repairs", label: "Repair Data", icon: Wrench },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#e8eef6]">
      <header className="shrink-0 border-b border-white/10 bg-[#071428] text-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a66d1] to-[#0d3f8a] text-xs font-extrabold">
              RR
            </span>
            <div>
              <div className="font-display text-sm font-extrabold tracking-wide sm:text-base">
                REPAIR RISK REVIEW
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">
                Admin Console
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-semibold hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-0 lg:gap-0">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200/80 bg-white lg:block">
          <nav className="sticky top-0 space-y-1 p-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Manage
            </p>
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  tab === t.key
                    ? "bg-[#071428] text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="flex w-full flex-col lg:min-w-0 lg:flex-1">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
                  tab === t.key ? "bg-[#071428] text-white" : "text-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {tab === "overview" && data && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-navy-900">Overview</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Live demo metrics from assessments, reports, and leads.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {(
                    [
                      { label: "Total Assessments", value: data.stats.totalAssessments, Icon: BarChart3, tone: "bg-blue-50 text-[#1a66d1]" },
                      { label: "Generated Reports", value: data.stats.generatedReports, Icon: FileText, tone: "bg-indigo-50 text-indigo-600" },
                      { label: "Captured Leads", value: data.stats.capturedLeads, Icon: Users, tone: "bg-emerald-50 text-emerald-600" },
                      { label: "Average Risk Score", value: data.stats.averageRiskScore, Icon: Settings2, tone: "bg-orange-50 text-orange-600" },
                    ] as const
                  ).map((item) => (
                    <div key={item.label} className="card p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          {item.label}
                        </p>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}>
                          <item.Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-4 font-display text-3xl font-extrabold text-navy-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="card p-6">
                  <h2 className="font-display text-lg font-bold text-navy-900">
                    System configuration
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Underwriter rules loaded:{" "}
                    <strong className="text-navy-900">
                      {formatNumber(data.stats.underwriterRules)}
                    </strong>
                    . Scoring tables, climate zones, and repair profiles are database-driven — not
                    hardcoded in the UI.
                  </p>
                </div>
              </div>
            )}

            {tab === "leads" && data && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-navy-900">
                    Captured Leads
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Qualified contacts who unlocked a full Repair Risk Review.
                  </p>
                </div>
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#f7f9fc] text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          <th className="px-5 py-3.5">Customer</th>
                          <th className="px-5 py-3.5">Vehicle</th>
                          <th className="px-5 py-3.5">Score</th>
                          <th className="px-5 py-3.5">Report</th>
                          <th className="px-5 py-3.5">Captured</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentLeads.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                              No leads yet. Complete a demo flow to populate this table.
                            </td>
                          </tr>
                        )}
                        {data.recentLeads.map((l) => (
                          <tr
                            key={l.id}
                            className="border-b border-slate-50 transition hover:bg-slate-50/80"
                          >
                            <td className="px-5 py-4">
                              <div className="font-semibold text-navy-900">
                                {l.customer.firstName} {l.customer.lastName}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500">{l.customer.email}</div>
                              <div className="text-xs text-slate-400">{l.customer.phone}</div>
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                              {l.assessment.year} {l.assessment.make} {l.assessment.model}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-bold text-navy-900">{l.assessment.finalScore}</div>
                              <span
                                className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${riskBgClass(l.assessment.riskLabel)}`}
                              >
                                {l.assessment.riskLabel}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <Link
                                href={`/report/${l.assessment.reportId}`}
                                className="font-semibold text-[#1a66d1] hover:underline"
                              >
                                {l.assessment.reportId}
                              </Link>
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {new Date(l.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === "vehicles" && data && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-navy-900">Vehicles</h1>
                  <p className="mt-1 text-sm text-slate-500">Demo catalog vehicles available for VIN lookup.</p>
                </div>
                <div className="card overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-[#f7f9fc] text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        <th className="px-5 py-3.5">VIN</th>
                        <th className="px-5 py-3.5">Vehicle</th>
                        <th className="px-5 py-3.5">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.vehicles.map((v) => (
                        <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                          <td className="px-5 py-4 font-mono text-xs font-medium">{v.vin}</td>
                          <td className="px-5 py-4 font-semibold text-navy-900">
                            {v.year} {v.make} {v.model}
                          </td>
                          <td className="px-5 py-4">{v.underwriterClass}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "rules" && data && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-navy-900">Risk Rules</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Version 1 class map and score adjustments (database-driven).
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h2 className="font-display font-bold text-navy-900">Class → Base Score</h2>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f7f9fc] text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          <th className="px-5 py-3 text-left">Class</th>
                          <th className="px-5 py-3 text-left">Base</th>
                          <th className="px-5 py-3 text-left">Band</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.riskRules.map((r) => (
                          <tr key={r.classNum} className="border-t border-slate-50">
                            <td className="px-5 py-2.5 font-semibold">{r.classNum}</td>
                            <td className="px-5 py-2.5">{r.baseScore}</td>
                            <td className="px-5 py-2.5 text-slate-600">{r.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h2 className="font-display font-bold text-navy-900">Score Adjustments</h2>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-[#f7f9fc] text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          <tr>
                            <th className="px-5 py-3 text-left">Category</th>
                            <th className="px-5 py-3 text-left">Range / Key</th>
                            <th className="px-5 py-3 text-left">Adj</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.adjustments.map((a) => (
                            <tr key={a.id} className="border-t border-slate-50">
                              <td className="px-5 py-2.5 capitalize">{a.category}</td>
                              <td className="px-5 py-2.5 text-slate-600">
                                {a.label || a.key || `${a.minValue}–${a.maxValue}`}
                              </td>
                              <td className="px-5 py-2.5 font-bold text-navy-900">
                                {a.adjustment > 0 ? `+${a.adjustment}` : a.adjustment}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "repairs" && data && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-navy-900">
                    Repair Data
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Cost bands and default risk used in top-six selection.
                  </p>
                </div>
                <div className="card overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-[#f7f9fc] text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        <th className="px-5 py-3.5">Repair</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Avg Cost</th>
                        <th className="px-5 py-3.5">Default Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.repairs.map((r) => (
                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                          <td className="px-5 py-3.5 font-semibold text-navy-900">{r.name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{r.category}</td>
                          <td className="px-5 py-3.5 font-medium">{formatCurrency(r.avgCost)}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${riskBgClass(r.defaultRisk)}`}
                            >
                              {r.defaultRisk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
