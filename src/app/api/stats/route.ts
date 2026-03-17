import { NextResponse } from "next/server";

import {
  getHardestVirtue,
  getLast13WeeksScores,
  getVirtueFocusForWeek,
} from "@/lib/db/queries";
import { getTrend } from "@/lib/utils/cycleStats";
import { getCurrentWeekStart } from "@/lib/utils/dates";
import type { CycleStatsData } from "@/types";

export async function GET() {
  try {
    const [hardestVirtue, weeklyScores, currentFocusVirtue] = await Promise.all([
      getHardestVirtue(),
      getLast13WeeksScores(),
      getVirtueFocusForWeek(getCurrentWeekStart()),
    ]);

    const data: CycleStatsData = {
      hardestVirtue,
      weeklyScores,
      currentCycleWeek: currentFocusVirtue.weekNumber,
      trend: getTrend(weeklyScores),
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/stats failed", error);

    return NextResponse.json(
      { error: "Failed to load cycle stats." },
      { status: 500 },
    );
  }
}
