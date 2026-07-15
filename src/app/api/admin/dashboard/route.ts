import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function requireAdmin() {
  const id = cookies().get("rrr_admin")?.value;
  if (!id) return null;
  const db = await readDb();
  return db.adminUsers.find((u) => u.id === id) || null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  const assessments = db.assessments.length;
  const leads = db.leads.length;
  const reports = db.reports.length;
  const avg =
    assessments === 0
      ? 0
      : Math.round(
          db.assessments.reduce((s, a) => s + a.finalScore, 0) / assessments
        );

  const recentLeads = db.leads
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 20)
    .map((l) => {
      const customer = db.customers.find((c) => c.id === l.customerId)!;
      const assessment = db.assessments.find((a) => a.id === l.assessmentId)!;
      return { ...l, customer, assessment };
    });

  return NextResponse.json({
    success: true,
    stats: {
      totalAssessments: assessments,
      generatedReports: reports,
      capturedLeads: leads,
      averageRiskScore: avg,
      underwriterRules: db.underwriterRules.length,
    },
    recentLeads,
    vehicles: db.vehicles,
    riskRules: db.riskClassMap,
    adjustments: db.scoreAdjustments,
    repairs: db.repairProfiles,
  });
}
