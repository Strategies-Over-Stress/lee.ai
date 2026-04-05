import { NextRequest, NextResponse } from "next/server";
import {
  getCollections,
  createCollection,
  getCollectionArticleIds,
  deleteCollection,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const collections = getCollections();
  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  const { name, articleIds } = await req.json();
  if (!name || !articleIds?.length) {
    return NextResponse.json(
      { error: "name and articleIds required" },
      { status: 400 },
    );
  }
  const collection = createCollection(name, articleIds);
  return NextResponse.json({ collection });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  deleteCollection(id);
  return NextResponse.json({ ok: true });
}
