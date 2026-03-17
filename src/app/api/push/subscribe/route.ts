import { NextRequest, NextResponse } from "next/server";

import { savePushSubscription } from "@/lib/db/queries";
import type { PushSubscriptionInput } from "@/types";

type SubscribeRequestBody = {
  subscription: PushSubscriptionInput;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPushSubscriptionInput(value: unknown): value is PushSubscriptionInput {
  if (!isRecord(value)) {
    return false;
  }

  const endpoint = value.endpoint;
  const keys = value.keys;

  return (
    typeof endpoint === "string" &&
    isRecord(keys) &&
    typeof keys.p256dh === "string" &&
    typeof keys.auth === "string"
  );
}

function isSubscribeRequestBody(value: unknown): value is SubscribeRequestBody {
  if (!isRecord(value)) {
    return false;
  }

  return isPushSubscriptionInput(value.subscription);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isSubscribeRequestBody(body)) {
      return NextResponse.json(
        { error: "Invalid push subscription payload." },
        { status: 400 },
      );
    }

    await savePushSubscription(body.subscription);

    return NextResponse.json({ data: { success: true } }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/push/subscribe failed", error);

    return NextResponse.json(
      { error: "Failed to save push subscription." },
      { status: 500 },
    );
  }
}
