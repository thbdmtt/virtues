import { NextRequest, NextResponse } from "next/server";

import {
  deletePushSubscriptionsByEndpoints,
  getPushSubscriptions,
} from "@/lib/db/queries";
import { getAppPassword } from "@/lib/auth/session";
import {
  getCronSecret,
  isPushConfigured,
  sendDailyNotifications,
} from "@/lib/push/notifications";

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const cronSecret = getCronSecret();
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || !authHeader) {
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

function isAuthorizedManualRequest(request: NextRequest): boolean {
  const appPassword = getAppPassword();
  const requestPassword = request.headers.get("x-app-password");

  if (!appPassword || !requestPassword) {
    return false;
  }

  return requestPassword === appPassword;
}

async function handleSendNotifications(request: NextRequest, status: number) {
  try {
    if (!isPushConfigured()) {
      return NextResponse.json(
        { error: "Push notifications are not configured." },
        { status: 500 },
      );
    }

    const isAuthorized =
      isAuthorizedCronRequest(request) || isAuthorizedManualRequest(request);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const subscriptions = await getPushSubscriptions();
    const { removedEndpoints, sentCount } =
      await sendDailyNotifications(subscriptions);

    await deletePushSubscriptionsByEndpoints(removedEndpoints);

    return NextResponse.json(
      {
        data: {
          removed: removedEndpoints.length,
          sent: sentCount,
        },
      },
      { status },
    );
  } catch (error: unknown) {
    console.error("/api/push/send failed", error);

    return NextResponse.json(
      { error: "Failed to send notifications." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return await handleSendNotifications(request, 200);
}

export async function POST(request: NextRequest) {
  return await handleSendNotifications(request, 200);
}
