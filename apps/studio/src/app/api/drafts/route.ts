import { NextRequest, NextResponse } from "next/server";
import { getDrafts, updateDraftStatus, updateDraftContent } from "@/lib/db";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const drafts = getDrafts(status);
  return NextResponse.json({ drafts });
}

export async function PATCH(req: NextRequest) {
  const { id, status, title, content } = await req.json();

  if (status) {
    updateDraftStatus(id, status);
  }
  if (title && content) {
    updateDraftContent(id, title, content);
  }

  return NextResponse.json({ ok: true });
}
