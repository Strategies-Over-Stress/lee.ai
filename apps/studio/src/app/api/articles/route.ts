import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("q") || undefined;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100", 10);
  const articles = getArticles(limit, search);
  return NextResponse.json({ articles });
}
