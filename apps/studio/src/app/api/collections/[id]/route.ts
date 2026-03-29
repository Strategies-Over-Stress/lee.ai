import { NextRequest, NextResponse } from "next/server";
import { getCollectionArticleIds } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const articleIds = getCollectionArticleIds(parseInt(id, 10));
  return NextResponse.json({ articleIds });
}
