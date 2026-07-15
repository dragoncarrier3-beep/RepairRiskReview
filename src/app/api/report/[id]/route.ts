import { NextRequest, NextResponse } from "next/server";
import { getFullReport } from "@/lib/assessment";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = await getFullReport(params.id);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found." },
        { status: 404 }
      );
    }
    if (!report.unlocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete the lead form to unlock your full report.",
          locked: true,
          teaser: {
            score: report.finalScore,
            riskLabel: report.riskLabel,
            reliabilityGrade: report.reliabilityGrade,
            exposure24: report.exposure24,
            assessmentId: report.id,
          },
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, report });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to load report. Please try again." },
      { status: 500 }
    );
  }
}
