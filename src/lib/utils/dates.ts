import {
  addDays,
  addWeeks,
  format,
  isSameMonth,
  isSameYear,
  startOfISOWeek,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";

const DATE_KEY_FORMAT = "yyyy-MM-dd";

function normalizeWeekStart(weekStart: Date): Date {
  return startOfISOWeek(weekStart);
}

export function getCurrentWeekStart(): Date {
  return normalizeWeekStart(new Date());
}

export function getWeekDays(weekStart: Date): Date[] {
  const start = normalizeWeekStart(weekStart);

  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function getWeekLabel(weekStart: Date): string {
  const start = normalizeWeekStart(weekStart);
  const end = addDays(start, 6);

  if (isSameYear(start, end) && isSameMonth(start, end)) {
    return `${format(start, "d")}–${format(end, "d MMMM yyyy", { locale: fr })}`;
  }

  if (isSameYear(start, end)) {
    return `${format(start, "d MMMM", { locale: fr })}–${format(
      end,
      "d MMMM yyyy",
      { locale: fr },
    )}`;
  }

  return `${format(start, "d MMMM yyyy", { locale: fr })}–${format(
    end,
    "d MMMM yyyy",
    { locale: fr },
  )}`;
}

export function getPreviousWeek(weekStart: Date): Date {
  return subWeeks(normalizeWeekStart(weekStart), 1);
}

export function getNextWeek(weekStart: Date): Date {
  return addWeeks(normalizeWeekStart(weekStart), 1);
}

export function getMillisecondsUntilNextDay(date: Date = new Date()): number {
  const nextDay = new Date(date);

  nextDay.setHours(24, 0, 0, 0);

  return Math.max(nextDay.getTime() - date.getTime(), 0);
}
