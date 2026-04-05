import { NextRequest, NextResponse } from "next/server";
import { getSources, addSource, updateSourceStatus, deleteSource } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const sources = getSources(status);
  return NextResponse.json({ sources });
}

export async function POST(req: NextRequest) {
  const { url, name } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }
  const source = addSource(url.replace(/\/$/, ""), name);
  if (!source) {
    return NextResponse.json({ error: "Source already exists" }, { status: 409 });
  }
  return NextResponse.json({ source });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  updateSourceStatus(id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  deleteSource(id);
  return NextResponse.json({ ok: true });
}
