import {
  addDays,
  format,
  startOfISOWeek,
  subWeeks,
} from "date-fns";
import { and, asc, count, desc, eq, gte, inArray, lte } from "drizzle-orm";

import type {
  HardestVirtue,
  Entry,
  HistoryItem,
  PushSubscriptionInput,
  PushSubscriptionRecord,
  Virtue,
} from "@/types";
import { getCycleWeekNumber } from "../utils/cycle";

import { db } from "./client";
import { entries, pushSubscriptions, virtues } from "./schema";

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

function getFocusWeekNumber(weekStart: Date): number {
  return getCycleWeekNumber(normalizeWeekStart(weekStart));
}

function getHistoryRange(): { start: string; end: string } {
  const currentWeekStart = normalizeWeekStart(new Date());

  return {
    start: formatDateKey(subWeeks(currentWeekStart, HISTORY_LENGTH - 1)),
    end: formatDateKey(addDays(currentWeekStart, 6)),
  };
}

export async function getVirtues(): Promise<Virtue[]> {
  return await db.select().from(virtues).orderBy(asc(virtues.id));
}

export async function getVirtueById(id: number): Promise<Virtue | null> {
  const matchingVirtues = await db
    .select()
    .from(virtues)
    .where(eq(virtues.id, id))
    .limit(1);

  return matchingVirtues[0] ?? null;
}

export async function getWeekEntries(weekStart: Date): Promise<Entry[]> {
  const weekRange = getWeekRange(weekStart);

  return await db
    .select()
    .from(entries)
    .where(
      and(
        gte(entries.date, weekRange.start),
        lte(entries.date, weekRange.end),
      ),
    )
    .orderBy(asc(entries.date), asc(entries.virtueId));
}

export async function toggleMark(date: string, virtueId: number): Promise<void> {
  const existingEntries = await db
    .select()
    .from(entries)
    .where(and(eq(entries.date, date), eq(entries.virtueId, virtueId)))
    .limit(1);
  const existingEntry = existingEntries[0];

  if (!existingEntry) {
    await db.insert(entries).values({ date, virtueId, hasMark: true });
    return;
  }

  if (existingEntry.hasMark) {
    await db
      .delete(entries)
      .where(and(eq(entries.date, date), eq(entries.virtueId, virtueId)));
    return;
  }

  await db
    .update(entries)
    .set({ hasMark: true })
    .where(and(eq(entries.date, date), eq(entries.virtueId, virtueId)));
}

export async function getVirtueFocusForWeek(weekStart: Date): Promise<Virtue> {
  const cycleWeekNumber = getFocusWeekNumber(weekStart);
  const virtuesForWeek = await db
    .select()
    .from(virtues)
    .where(eq(virtues.weekNumber, cycleWeekNumber))
    .limit(1);
  const virtue = virtuesForWeek[0];

  if (!virtue) {
    throw new Error(
      `Virtue for cycle week ${cycleWeekNumber} not found for the requested week.`,
    );
  }

  return virtue;
}

export async function getWeekScore(weekStart: Date): Promise<number> {
  const weekRange = getWeekRange(weekStart);
  const results = await db
    .select({ score: count() })
    .from(entries)
    .where(
      and(
        eq(entries.hasMark, true),
        gte(entries.date, weekRange.start),
        lte(entries.date, weekRange.end),
      ),
    );
  const result = results[0];

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

export async function getHardestVirtue(): Promise<HardestVirtue> {
  const historyRange = getHistoryRange();
  const [virtuesList, markedEntries] = await Promise.all([
    getVirtues(),
    db
      .select({ virtueId: entries.virtueId })
      .from(entries)
      .where(
        and(
          eq(entries.hasMark, true),
          gte(entries.date, historyRange.start),
          lte(entries.date, historyRange.end),
        ),
      ),
  ]);
  const totals = markedEntries.reduce<Map<number, number>>((map, entry) => {
    const currentTotal = map.get(entry.virtueId) ?? 0;

    map.set(entry.virtueId, currentTotal + 1);
    return map;
  }, new Map<number, number>());
  const firstVirtue = virtuesList[0];

  if (!firstVirtue) {
    throw new Error("No virtues available to compute hardest virtue.");
  }

  return virtuesList.reduce<HardestVirtue>((hardest, virtue) => {
    const totalMarks = totals.get(virtue.id) ?? 0;

    if (
      totalMarks > hardest.totalMarks ||
      (totalMarks === hardest.totalMarks && virtue.id < hardest.id)
    ) {
      return {
        id: virtue.id,
        nameFr: virtue.nameFr,
        totalMarks,
      };
    }

    return hardest;
  }, {
    id: firstVirtue.id,
    nameFr: firstVirtue.nameFr,
    totalMarks: totals.get(firstVirtue.id) ?? 0,
  });
}

export async function savePushSubscription(
  subscription: PushSubscriptionInput,
): Promise<void> {
  const createdAt = new Date().toISOString();

  await db
    .insert(pushSubscriptions)
    .values({
      endpoint: subscription.endpoint,
      keysP256dh: subscription.keys.p256dh,
      keysAuth: subscription.keys.auth,
      createdAt,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        keysP256dh: subscription.keys.p256dh,
        keysAuth: subscription.keys.auth,
        createdAt,
      },
    });
}

export async function getPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  return await db
    .select()
    .from(pushSubscriptions)
    .orderBy(desc(pushSubscriptions.createdAt));
}

export async function deletePushSubscriptionsByEndpoints(
  endpoints: string[],
): Promise<void> {
  if (endpoints.length === 0) {
    return;
  }

  await db
    .delete(pushSubscriptions)
    .where(inArray(pushSubscriptions.endpoint, endpoints));
}
