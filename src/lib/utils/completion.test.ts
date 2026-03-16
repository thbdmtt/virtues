import { describe, expect, it } from "vitest";

import type { Entry } from "@/types";

import { isDayComplete } from "./completion";

const TARGET_DATE = "2026-03-16";

function createEntry(virtueId: number, hasMark: boolean): Entry {
  return {
    date: TARGET_DATE,
    virtueId,
    hasMark,
  };
}

describe("isDayComplete", () => {
  it("returns false when there are no entries for the day", () => {
    expect(isDayComplete(TARGET_DATE, [])).toBe(false);
  });

  it("returns false when only 12 virtues are present", () => {
    const entries = Array.from({ length: 12 }, (_, index) =>
      createEntry(index + 1, index % 2 === 0),
    );

    expect(isDayComplete(TARGET_DATE, entries)).toBe(false);
  });

  it("returns true when all 13 virtues are present", () => {
    const entries = Array.from({ length: 13 }, (_, index) =>
      createEntry(index + 1, index % 2 === 0),
    );

    expect(isDayComplete(TARGET_DATE, entries)).toBe(true);
  });

  it("returns false when 13 entries include a duplicated virtue", () => {
    const entries = [
      ...Array.from({ length: 12 }, (_, index) =>
        createEntry(index + 1, index % 2 === 0),
      ),
      createEntry(12, true),
    ];

    expect(isDayComplete(TARGET_DATE, entries)).toBe(false);
  });
});
