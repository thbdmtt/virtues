import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatDateKey,
  getCurrentWeekStart,
  getMillisecondsUntilNextDay,
  getNextWeek,
  getPreviousWeek,
  getWeekDays,
  getWeekLabel,
} from "./dates";

describe("dates utilities", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("getCurrentWeekStart returns the Monday of the current week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 13, 14, 30, 0));

    expect(formatDateKey(getCurrentWeekStart())).toBe("2026-03-09");
  });

  it("getWeekDays returns the seven dates from Monday to Sunday", () => {
    const weekStart = new Date(2026, 2, 11);

    expect(getWeekDays(weekStart).map(formatDateKey)).toEqual([
      "2026-03-09",
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
      "2026-03-13",
      "2026-03-14",
      "2026-03-15",
    ]);
  });

  it('formatDateKey returns a "YYYY-MM-DD" string', () => {
    expect(formatDateKey(new Date(2026, 2, 13, 9, 45, 0))).toBe("2026-03-13");
  });

  it("getWeekLabel formats a week range in French", () => {
    expect(getWeekLabel(new Date(2026, 2, 10))).toBe("9–15 mars 2026");
  });

  it("getPreviousWeek returns the previous Monday", () => {
    expect(formatDateKey(getPreviousWeek(new Date(2026, 2, 10)))).toBe(
      "2026-03-02",
    );
  });

  it("getNextWeek returns the next Monday", () => {
    expect(formatDateKey(getNextWeek(new Date(2026, 2, 10)))).toBe(
      "2026-03-16",
    );
  });

  it("getMillisecondsUntilNextDay returns the delay until local midnight", () => {
    expect(
      getMillisecondsUntilNextDay(new Date(2026, 2, 13, 23, 59, 30, 0)),
    ).toBe(30_000);
  });
});
