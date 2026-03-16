import { isValid, parseISO } from "date-fns";

import AppShell from "@/components/AppShell";
import {
  getBaseUrl,
  getRequestCookieHeader,
} from "@/lib/http/getBaseUrl";
import { formatDateKey } from "@/lib/utils/dates";
import { getWeekMarkKey } from "@/lib/utils/marks";
import type { WeekData } from "@/types";

type WeekApiSuccess = {
  data: WeekData;
};

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

type HomePageProps = {
  searchParams: PageSearchParams;
};

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function getRequestedWeekStart(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const rawValue = searchParams.weekStart;
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  if (!value || !DATE_PARAM_PATTERN.test(value)) {
    return null;
  }

  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return null;
  }

  return formatDateKey(parsedDate);
}

async function getWeekData(weekStart: string | null): Promise<WeekData> {
  const baseUrl = await getBaseUrl();
  const cookieHeader = await getRequestCookieHeader();
  const requestUrl = weekStart
    ? `${baseUrl}/api/week?weekStart=${weekStart}`
    : `${baseUrl}/api/week`;
  const response = await fetch(requestUrl, {
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

function buildInitialWeekMarks(weekData: WeekData): Record<string, boolean> {
  return weekData.weekDays.reduce<Record<string, boolean>>((allMarks, day, dayIdx) => {
    for (const virtue of weekData.virtues) {
      allMarks[getWeekMarkKey(virtue.id, dayIdx)] =
        weekData.entries[`${day.date}:${virtue.id}`] === "marked";
    }

    return allMarks;
  }, {});
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const weekData = await getWeekData(getRequestedWeekStart(resolvedSearchParams));
  const todayDate = formatDateKey(new Date());

  return (
    <AppShell
      virtues={weekData.virtues}
      focusVirtue={weekData.virtueFocus}
      focusWeekNum={weekData.virtueFocus.weekNumber}
      initialMarks={buildInitialWeekMarks(weekData)}
      isTodayComplete={weekData.completedDays.includes(todayDate)}
      weekDates={weekData.weekDays.map((day) => day.date)}
      weekLabel={weekData.weekLabel}
    />
  );
}
