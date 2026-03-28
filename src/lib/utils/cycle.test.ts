import { afterEach, describe, expect, it } from "vitest";

import { getCycleOriginWeekStart, getCycleWeekNumber } from "./cycle";
import { formatDateKey } from "./dates";

const originalCycleOriginWeekStart =
  process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START;

describe("cycle utilities", () => {
  afterEach(() => {
    if (originalCycleOriginWeekStart) {
      process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START =
        originalCycleOriginWeekStart;
      return;
    }

    delete process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START;
  });

  it("uses the configured origin week to compute cycle week numbers", () => {
    const cycleOriginWeekStart = new Date("2026-03-16T12:00:00");

    expect(getCycleWeekNumber(new Date("2026-03-16T12:00:00"), cycleOriginWeekStart)).toBe(1);
    expect(getCycleWeekNumber(new Date("2026-03-23T12:00:00"), cycleOriginWeekStart)).toBe(2);
    expect(getCycleWeekNumber(new Date("2026-06-08T12:00:00"), cycleOriginWeekStart)).toBe(13);
  });

  it("normalizes the configured origin to the Monday of its week", () => {
    process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START = "2026-03-18";

    expect(formatDateKey(getCycleOriginWeekStart())).toBe("2026-03-16");
  });

  it("throws when the configured origin is invalid", () => {
    process.env.FRANKLIN_CYCLE_ORIGIN_WEEK_START = "invalid-date";

    expect(() => getCycleOriginWeekStart()).toThrow(
      "FRANKLIN_CYCLE_ORIGIN_WEEK_START invalide. Format attendu : YYYY-MM-DD.",
    );
  });
});
