import { NextRequest, NextResponse } from "next/server";
import { captureLead } from "@/lib/assessment";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  assessmentId: z.string().min(1),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  zipCode: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required" }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message || "Invalid form data",
        },
        { status: 400 }
      );
    }

    const result = await captureLead({
      ...parsed.data,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      sourceUrl: req.headers.get("referer") || "/",
    });

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Unable to generate report." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId: result.reportId,
      slug: result.report?.slug,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? e.message : "Unable to save your information. Please try again.",
      },
      { status: 500 }
    );
  }
}
