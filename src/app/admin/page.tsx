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
import { formatCurrency, formatNumber } from "@/lib/utils";

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
      <div className="flex min-h-screen items-center justify-center bg-navy-950 text-white">
        Loading admin…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-950 to-navy-800 px-4">
        <form onSubmit={onLogin} className="card w-full max-w-md p-8">
          <div className="text-center">
            <div className="text-lg font-bold text-navy-900">Admin Dashboard</div>
            <p className="mt-1 text-sm text-slate-600">Repair Risk Review</p>
          </div>
          <div className="mt-6 space-y-4">
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
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
            <p className="text-center text-xs text-slate-500">
              Demo: admin@repairriskreview.com / Demo123!
            </p>
            <Link href="/" className="block text-center text-sm text-brand-blue">
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
    <div className="min-h-screen bg-[#eef2f7]">
      <header className="border-b border-white/10 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-bold tracking-wide">REPAIR RISK REVIEW</div>
            <div className="text-[11px] uppercase tracking-widest text-blue-200">Admin Console</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${
                tab === t.key ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </aside>

        <div className="space-y-5">
          {tab === "overview" && data && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {(
                  [
                    { label: "Total Assessments", value: data.stats.totalAssessments, Icon: BarChart3 },
                    { label: "Generated Reports", value: data.stats.generatedReports, Icon: FileText },
                    { label: "Captured Leads", value: data.stats.capturedLeads, Icon: Users },
                    { label: "Average Risk Score", value: data.stats.averageRiskScore, Icon: Settings2 },
                  ] as const
                ).map((item) => (
                  <div key={item.label} className="card p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {item.label}
                      </p>
                      <item.Icon className="h-4 w-4 text-brand-blue" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-navy-900">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <h2 className="font-bold text-navy-900">System configuration</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Underwriter rules loaded:{" "}
                  <strong>{formatNumber(data.stats.underwriterRules)}</strong> · Scoring tables,
                  climate zones, and repair profiles are database-driven (not hardcoded in the UI).
                </p>
              </div>
            </>
          )}

          {tab === "leads" && data && (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-navy-900">Captured Leads</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Report</th>
                      <th className="px-4 py-3">Captured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLeads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          No leads yet. Complete a demo flow to populate this table.
                        </td>
                      </tr>
                    )}
                    {data.recentLeads.map((l) => (
                      <tr key={l.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {l.customer.firstName} {l.customer.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{l.customer.email}</div>
                          <div className="text-xs text-slate-500">{l.customer.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          {l.assessment.year} {l.assessment.make} {l.assessment.model}
                        </td>
                        <td className="px-4 py-3">
                          {l.assessment.finalScore} · {l.assessment.riskLabel}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/report/${l.assessment.reportId}`}
                            className="text-brand-blue hover:underline"
                          >
                            {l.assessment.reportId}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(l.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "vehicles" && data && (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-navy-900">Demo Vehicles</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">VIN</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehicles.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono text-xs">{v.vin}</td>
                      <td className="px-4 py-3">
                        {v.year} {v.make} {v.model}
                      </td>
                      <td className="px-4 py-3">{v.underwriterClass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "rules" && data && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-bold text-navy-900">Class → Base Score</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Base Score</th>
                      <th className="px-4 py-3 text-left">Band</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.riskRules.map((r) => (
                      <tr key={r.classNum} className="border-t border-slate-100">
                        <td className="px-4 py-2">{r.classNum}</td>
                        <td className="px-4 py-2">{r.baseScore}</td>
                        <td className="px-4 py-2">{r.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-bold text-navy-900">Score Adjustments</h2>
                </div>
                <div className="max-h-[480px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Range / Key</th>
                        <th className="px-4 py-3 text-left">Adj</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.adjustments.map((a) => (
                        <tr key={a.id} className="border-t border-slate-100">
                          <td className="px-4 py-2 capitalize">{a.category}</td>
                          <td className="px-4 py-2">
                            {a.label || a.key || `${a.minValue}–${a.maxValue}`}
                          </td>
                          <td className="px-4 py-2 font-semibold">
                            {a.adjustment > 0 ? `+${a.adjustment}` : a.adjustment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "repairs" && data && (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-navy-900">Repair Profiles</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Repair</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Avg Cost</th>
                    <th className="px-4 py-3">Default Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.repairs.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3">{formatCurrency(r.avgCost)}</td>
                      <td className="px-4 py-3">{r.defaultRisk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
