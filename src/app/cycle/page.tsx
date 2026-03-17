import CyclePage from "@/components/CyclePage";
import { getBaseUrl, getRequestCookieHeader } from "@/lib/http/getBaseUrl";
import type { CycleStatsData, HistoryItem, WeekData } from "@/types";

type HistoryApiSuccess = {
  data: HistoryItem[];
};

type StatsApiSuccess = {
  data: CycleStatsData;
};

type WeekApiSuccess = {
  data: WeekData;
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

function isWeekApiSuccess(value: unknown): value is WeekApiSuccess {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    isRecord(value.data.virtueFocus) &&
    typeof value.data.weekLabel === "string"
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
  const [historyPayload, statsPayload, weekPayload] = await Promise.all([
    fetchLocalApi("/api/history"),
    fetchLocalApi("/api/stats"),
    fetchLocalApi("/api/week"),
  ]);

  if (!isHistoryApiSuccess(historyPayload)) {
    throw new Error("/api/history returned an invalid payload.");
  }

  if (!isStatsApiSuccess(statsPayload)) {
    throw new Error("/api/stats returned an invalid payload.");
  }

  if (!isWeekApiSuccess(weekPayload)) {
    throw new Error("/api/week returned an invalid payload.");
  }

  return (
    <CyclePage
      currentFocusName={weekPayload.data.virtueFocus.nameFr}
      history={historyPayload.data}
      stats={statsPayload.data}
    />
  );
}
