import { NextResponse } from "next/server";
import { listGenerators } from "@/generators";

export async function GET() {
  const generators = listGenerators().map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
  return NextResponse.json({ generators });
}
