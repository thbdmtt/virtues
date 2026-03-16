import type { Entry } from "@/types";

const FRANKLIN_VIRTUES_COUNT = 13;

export function isDayComplete(date: string, entries: Entry[]): boolean {
  const dayEntries = entries.filter((entry) => entry.date === date);
  const virtuesForDay = new Set(dayEntries.map((entry) => entry.virtueId));

  return (
    dayEntries.length === FRANKLIN_VIRTUES_COUNT &&
    virtuesForDay.size === FRANKLIN_VIRTUES_COUNT
  );
}
