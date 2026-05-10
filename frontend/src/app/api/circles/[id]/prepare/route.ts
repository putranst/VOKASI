// POST /api/circles/[id]/prepare
// Alias — preparation is handled in the parent /api/circles/[id] route
// This stub ensures Next.js routing works correctly
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Forward to parent route handler via redirect
  return NextResponse.json({ error: "Use POST /api/circles/" + id + " instead" }, { status: 400 });
}
