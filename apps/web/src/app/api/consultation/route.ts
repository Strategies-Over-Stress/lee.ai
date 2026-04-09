import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateConsultation, getAssessment } from "@/lib/db";

const consultationSchema = z.object({
  assessmentId: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(20).optional(),
  preferredTime: z.string().min(1).max(100),
  businessDescription: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = consultationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { assessmentId, name, email, phone, preferredTime, businessDescription } = parsed.data;

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

    console.log(`[CONSULTATION] New request from ${email} (assessment: ${assessmentId})`);

    return NextResponse.json({ success: true, assessmentId });
  } catch {
    return NextResponse.json({ error: "Failed to save consultation" }, { status: 500 });
  }
}
