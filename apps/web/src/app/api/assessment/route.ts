import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { insertAssessment } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, totalScore, potentialRevenue, resultProfile } = body;

    if (!answers || totalScore === undefined || potentialRevenue === undefined || !resultProfile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = uuidv4();
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? null;

    insertAssessment({
      id,
      answers: JSON.stringify(answers),
      totalScore,
      potentialRevenue,
      resultProfile,
      ipAddress,
    });

    return NextResponse.json({ id, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 });
  }
}
