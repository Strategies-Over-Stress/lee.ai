import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { insertAssessment, hashIp } from "@/lib/db";

const assessmentSchema = z.object({
  answers: z.record(z.string(), z.unknown()).refine(
    (val) => JSON.stringify(val).length <= 51200,
    { message: "Payload too large" }
  ),
  totalScore: z.number().int().min(0).max(100),
  potentialRevenue: z.number().min(0).max(1000000),
  resultProfile: z.object({
    title: z.string(),
    color: z.string(),
  }).passthrough(),
  contactInfo: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = assessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { answers, totalScore, potentialRevenue, resultProfile } = parsed.data;

    const id = uuidv4();
    const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? null;
    const ipAddress = rawIp ? hashIp(rawIp) : null;

    insertAssessment({
      id,
      answers: JSON.stringify(answers),
      totalScore,
      potentialRevenue,
      resultProfile: JSON.stringify(resultProfile),
      ipAddress,
    });

    return NextResponse.json({ id, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 });
  }
}
