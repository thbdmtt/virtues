import AppShell from "@/components/AppShell";
import { getRequestCookieHeader, getBaseUrl } from "@/lib/http/getBaseUrl";
import type { WeekData } from "@/types";

type WeekApiSuccess = {
  data: WeekData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWeekApiSuccess(value: unknown): value is WeekApiSuccess {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;

  return (
    isRecord(data) &&
    Array.isArray(data.virtues) &&
    typeof data.weekLabel === "string"
  );
}

async function getWeekData(): Promise<WeekData> {
  const baseUrl = await getBaseUrl();
  const cookieHeader = await getRequestCookieHeader();
  const response = await fetch(`${baseUrl}/api/week`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch week data.");
  }

  if (!isWeekApiSuccess(payload)) {
    throw new Error("Week API returned an invalid payload.");
  }

  return payload.data;
}

export default async function HomePage() {
  const weekData = await getWeekData();
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY?.trim() ?? null;

  return (
    <AppShell
      initialWeekData={weekData}
      vapidPublicKey={vapidPublicKey}
    />
  );
}
