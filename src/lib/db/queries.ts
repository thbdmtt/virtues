import {
  addDays,
  format,
  getISOWeek,
  startOfISOWeek,
  subWeeks,
} from "date-fns";
import { and, asc, count, eq, gte, lte } from "drizzle-orm";

import type { Entry, HistoryItem, Virtue } from "@/types";

import { db } from "./client";
import { entries, virtues } from "./schema";

const CYCLE_LENGTH = 13;
const HISTORY_LENGTH = 13;
const DATE_KEY_FORMAT = "yyyy-MM-dd";

function formatDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

function normalizeWeekStart(weekStart: Date): Date {
  return startOfISOWeek(weekStart);
}

function getWeekRange(weekStart: Date): { start: string; end: string } {
  const normalizedWeekStart = normalizeWeekStart(weekStart);

  return {
    start: formatDateKey(normalizedWeekStart),
    end: formatDateKey(addDays(normalizedWeekStart, 6)),
  };
}

function getFocusVirtueId(weekStart: Date): number {
  const isoWeekNumber = getISOWeek(normalizeWeekStart(weekStart));

  return ((isoWeekNumber - 1) % CYCLE_LENGTH) + 1;
}

export async function getVirtues(): Promise<Virtue[]> {
  return db.select().from(virtues).orderBy(asc(virtues.id)).all();
}

export async function getWeekEntries(weekStart: Date): Promise<Entry[]> {
  const weekRange = getWeekRange(weekStart);

  return db
    .select()
    .from(entries)
    .where(
      and(
        gte(entries.date, weekRange.start),
        lte(entries.date, weekRange.end),
      ),
    )
    .orderBy(asc(entries.date), asc(entries.virtueId))
    .all();
}

export async function toggleMark(date: string, virtueId: number): Promise<void> {
  const existingEntry = db
    .select()
    .from(entries)
    .where(and(eq(entries.date, date), eq(entries.virtueId, virtueId)))
    .limit(1)
    .get();

  if (!existingEntry) {
    db.insert(entries).values({ date, virtueId, hasMark: true }).run();
    return;
  }

  if (existingEntry.hasMark) {
    db
      .delete(entries)
      .where(and(eq(entries.date, date), eq(entries.virtueId, virtueId)))
      .run();
    return;
  }

  db
    .update(entries)
    .set({ hasMark: true })
    .where(and(eq(entries.date, date), eq(entries.virtueId, virtueId)))
    .run();
}

export async function getVirtueFocusForWeek(weekStart: Date): Promise<Virtue> {
  const virtueId = getFocusVirtueId(weekStart);
  const virtue = db
    .select()
    .from(virtues)
    .where(eq(virtues.id, virtueId))
    .limit(1)
    .get();

  if (!virtue) {
    throw new Error(`Virtue ${virtueId} not found for the requested week.`);
  }

  return virtue;
}

export async function getWeekScore(weekStart: Date): Promise<number> {
  const weekRange = getWeekRange(weekStart);
  const result = db
    .select({ score: count() })
    .from(entries)
    .where(
      and(
        eq(entries.hasMark, true),
        gte(entries.date, weekRange.start),
        lte(entries.date, weekRange.end),
      ),
    )
    .get();

  return result?.score ?? 0;
}

export async function getLast13WeeksScores(): Promise<HistoryItem[]> {
  const currentWeekStart = normalizeWeekStart(new Date());
  const weeks = Array.from({ length: HISTORY_LENGTH }, (_, index) =>
    subWeeks(currentWeekStart, HISTORY_LENGTH - index - 1),
  );

  return Promise.all(
    weeks.map(async (weekStart) => ({
      weekStart: formatDateKey(weekStart),
      score: await getWeekScore(weekStart),
    })),
  );
}
