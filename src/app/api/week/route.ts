import { isValid, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

import {
  getVirtueFocusForWeek,
  getVirtues,
  getWeekEntries,
  getWeekScore,
} from "@/lib/db/queries";
import {
  formatDateKey,
  getCurrentWeekStart,
  getWeekDays,
  getWeekLabel,
} from "@/lib/utils/dates";
import { isDayComplete } from "@/lib/utils/completion";
import type { CellState, DayData, Entry, Virtue, WeekData } from "@/types";

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getEntryKey(date: string, virtueId: number): string {
  return `${date}:${virtueId}`;
}

function parseWeekStartParam(value: string | null): Date | null {
  if (!value) {
    return getCurrentWeekStart();
  }

  if (!DATE_PARAM_PATTERN.test(value)) {
    return null;
  }

  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return null;
  }

  return parsedDate;
}

function getEntryState(entry: Entry): CellState {
  return entry.hasMark ? "marked" : "clean";
}

function createEmptyEntryMap(weekDays: Date[], virtues: Virtue[]): Record<string, CellState> {
  return weekDays.reduce<Record<string, CellState>>((map, day) => {
    const dateKey = formatDateKey(day);

    for (const virtue of virtues) {
      map[getEntryKey(dateKey, virtue.id)] = "empty";
    }

    return map;
  }, {});
}

function createWeekDaysData(
  weekDays: Date[],
  virtues: Virtue[],
  entriesMap: Record<string, CellState>,
): DayData[] {
  return weekDays.map((day) => {
    const dateKey = formatDateKey(day);
    const cells = virtues.reduce<Record<number, CellState>>((map, virtue) => {
      map[virtue.id] = entriesMap[getEntryKey(dateKey, virtue.id)] ?? "empty";
      return map;
    }, {});

    return {
      date: dateKey,
      cells,
    };
  });
}

function getCompletedDays(weekDays: Date[], weekEntries: Entry[]): string[] {
  return weekDays
    .map((day) => formatDateKey(day))
    .filter((date) => isDayComplete(date, weekEntries));
}

function createVirtuePayload(virtue: Virtue): Virtue {
  return {
    id: virtue.id,
    nameFr: virtue.nameFr,
    nameEn: virtue.nameEn,
    description: virtue.description,
    maxim: virtue.maxim,
    reflection: virtue.reflection,
    weekNumber: virtue.weekNumber,
  };
}

export async function GET(request: NextRequest) {
  try {
    const requestedWeekStart = parseWeekStartParam(
      request.nextUrl.searchParams.get("weekStart"),
    );

    if (!requestedWeekStart) {
      return NextResponse.json(
        { error: "Invalid weekStart. Expected format YYYY-MM-DD." },
        { status: 400 },
      );
    }

    const [virtues, weekEntries, virtueFocus, weekScore] = await Promise.all([
      getVirtues(),
      getWeekEntries(requestedWeekStart),
      getVirtueFocusForWeek(requestedWeekStart),
      getWeekScore(requestedWeekStart),
    ]);

    const weekDays = getWeekDays(requestedWeekStart);
    const entriesMap = createEmptyEntryMap(weekDays, virtues);

    for (const entry of weekEntries) {
      entriesMap[getEntryKey(entry.date, entry.virtueId)] = getEntryState(entry);
    }

    const data: WeekData = {
      weekStart: formatDateKey(weekDays[0]),
      weekLabel: getWeekLabel(requestedWeekStart),
      weekDays: createWeekDaysData(weekDays, virtues, entriesMap),
      completedDays: getCompletedDays(weekDays, weekEntries),
      virtues: virtues.map(createVirtuePayload),
      entries: entriesMap,
      virtueFocus: createVirtuePayload(virtueFocus),
      weekScore,
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/week failed", error);

    return NextResponse.json(
      { error: "Failed to load week data." },
      { status: 500 },
    );
  }
}
