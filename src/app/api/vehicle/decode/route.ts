import { NextRequest, NextResponse } from "next/server";
import { lookupVin } from "@/lib/assessment";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vin = String(body.vin || "");
    const result = await lookupVin(vin);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message, allowManual: true },
        { status: 200 }
      );
    }
    return NextResponse.json({ success: true, vehicle: result.vehicle });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Vehicle information unavailable. Please enter vehicle details manually.",
        allowManual: true,
      },
      { status: 200 }
    );
  }
}
