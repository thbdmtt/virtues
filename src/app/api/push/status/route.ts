import { NextResponse } from "next/server";

import { getPushSubscriptions } from "@/lib/db/queries";

export async function GET() {
  try {
    const subscriptions = await getPushSubscriptions();

    return NextResponse.json(
      { data: { subscribed: subscriptions.length > 0 } },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/push/status failed", error);

    return NextResponse.json(
      { error: "Failed to load push status." },
      { status: 500 },
    );
  }
}
