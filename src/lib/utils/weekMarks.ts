import type { WeekData } from "@/types";

import { getWeekMarkKey } from "./marks";

export function buildWeekMarks(weekData: WeekData): Record<string, boolean> {
  return weekData.weekDays.reduce<Record<string, boolean>>((allMarks, day, dayIdx) => {
    for (const virtue of weekData.virtues) {
      allMarks[getWeekMarkKey(virtue.id, dayIdx)] =
        weekData.entries[`${day.date}:${virtue.id}`] === "marked";
    }

    return allMarks;
  }, {});
}
