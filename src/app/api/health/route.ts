import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      {
        data: {
          status: "ok",
          timestamp: Date.now(),
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/health failed", error);

    return NextResponse.json(
      { error: "Failed to check health." },
      { status: 500 },
    );
  }
}
