import {
  differenceInCalendarWeeks,
  isValid,
  parseISO,
  startOfISOWeek,
} from "date-fns";

const CYCLE_LENGTH = 13;
const DEFAULT_CYCLE_ORIGIN_WEEK_START = "2026-03-16";
const CYCLE_ORIGIN_ENV_KEY = "FRANKLIN_CYCLE_ORIGIN_WEEK_START";

function getPositiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function parseCycleOriginWeekStart(value: string | undefined): Date {
  const normalizedValue = value?.trim() || DEFAULT_CYCLE_ORIGIN_WEEK_START;
  const parsedDate = parseISO(normalizedValue);

  if (!isValid(parsedDate)) {
    throw new Error(
      `${CYCLE_ORIGIN_ENV_KEY} invalide. Format attendu : YYYY-MM-DD.`,
    );
  }

  return startOfISOWeek(parsedDate);
}

export function getCycleOriginWeekStart(): Date {
  return parseCycleOriginWeekStart(process.env[CYCLE_ORIGIN_ENV_KEY]);
}

export function getCycleWeekNumber(
  weekStart: Date,
  cycleOriginWeekStart: Date = getCycleOriginWeekStart(),
): number {
  const normalizedWeekStart = startOfISOWeek(weekStart);
  const normalizedOriginWeekStart = startOfISOWeek(cycleOriginWeekStart);
  const weeksSinceOrigin = differenceInCalendarWeeks(
    normalizedWeekStart,
    normalizedOriginWeekStart,
    { weekStartsOn: 1 },
  );

  return getPositiveModulo(weeksSinceOrigin, CYCLE_LENGTH) + 1;
}
