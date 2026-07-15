import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const db = await readDb();
    const user = db.adminUsers.find(
      (u) => u.email === String(email || "").toLowerCase()
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }
    const ok = await bcrypt.compare(String(password || ""), user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    cookies().set("rrr_admin", user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true, name: user.name });
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  cookies().set("rrr_admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
