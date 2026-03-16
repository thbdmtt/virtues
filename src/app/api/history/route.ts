import { NextResponse } from "next/server";

import { getLast13WeeksScores } from "@/lib/db/queries";

export async function GET() {
  try {
    const data = await getLast13WeeksScores();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/history failed", error);

    return NextResponse.json(
      { error: "Failed to load history." },
      { status: 500 },
    );
  }
}
