import CyclePage from "@/components/CyclePage";
import { getBaseUrl, getRequestCookieHeader } from "@/lib/http/getBaseUrl";
import type { CycleStatsData, HistoryItem } from "@/types";

type HistoryApiSuccess = {
  data: HistoryItem[];
};

type StatsApiSuccess = {
  data: CycleStatsData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHistoryApiSuccess(value: unknown): value is HistoryApiSuccess {
  return isRecord(value) && Array.isArray(value.data);
}

function isStatsApiSuccess(value: unknown): value is StatsApiSuccess {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    typeof value.data.currentCycleWeek === "number" &&
    Array.isArray(value.data.weeklyScores)
  );
}

async function fetchLocalApi(pathname: string): Promise<unknown> {
  const baseUrl = await getBaseUrl();
  const cookieHeader = await getRequestCookieHeader();
  const response = await fetch(`${baseUrl}${pathname}`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch ${pathname}.`);
  }

  return payload;
}

export default async function CycleRoutePage() {
  const [historyPayload, statsPayload] = await Promise.all([
    fetchLocalApi("/api/history"),
    fetchLocalApi("/api/stats"),
  ]);

  if (!isHistoryApiSuccess(historyPayload)) {
    throw new Error("/api/history returned an invalid payload.");
  }

  if (!isStatsApiSuccess(statsPayload)) {
    throw new Error("/api/stats returned an invalid payload.");
  }

  return <CyclePage history={historyPayload.data} stats={statsPayload.data} />;
}
