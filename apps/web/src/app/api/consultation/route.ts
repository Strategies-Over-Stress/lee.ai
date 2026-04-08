import { NextRequest, NextResponse } from "next/server";
import { updateConsultation, getAssessment } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, name, email, phone, preferredTime, businessDescription } = body;

    if (!assessmentId || !name || !email || !preferredTime || !businessDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assessment = getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const updated = updateConsultation({
      assessmentId,
      name,
      email,
      phone: phone || null,
      preferredTime,
      businessDescription,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update assessment" }, { status: 500 });
    }

    return NextResponse.json({ success: true, assessmentId });
  } catch {
    return NextResponse.json({ error: "Failed to save consultation" }, { status: 500 });
  }
}
