import { NextRequest, NextResponse } from "next/server";
import { createAssessmentPreview, createFromManual, lookupVin } from "@/lib/assessment";
import { DEMO_VIN } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mileage = Number(body.mileage) || 112450;
    const zipCode = String(body.zipCode || "48304");

    if (body.manual) {
      const preview = await createFromManual({
        year: Number(body.year),
        make: String(body.make),
        model: String(body.model),
        trim: body.trim,
        engine: body.engine,
        transmission: body.transmission,
        drivetrain: body.drivetrain,
        fuelType: body.fuelType,
        bodyStyle: body.bodyStyle,
        mileage,
        zipCode,
        vin: body.vin,
      });
      return NextResponse.json({ success: true, ...preview });
    }

    const vin = String(body.vin || DEMO_VIN);
    const lookup = await lookupVin(vin);
    if (!lookup.ok) {
      return NextResponse.json(
        { success: false, message: lookup.message, allowManual: true },
        { status: 200 }
      );
    }

    const preview = await createAssessmentPreview({
      vehicle: lookup.vehicle,
      mileage,
      zipCode,
    });

    return NextResponse.json({ success: true, ...preview });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "We could not complete the analysis. Please try again or enter vehicle details manually.",
      },
      { status: 500 }
    );
  }
}
