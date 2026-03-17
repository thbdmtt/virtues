import type {
  CycleSegment,
  HistoryItem,
  Trend,
} from "@/types";

const CYCLE_LENGTH = 13;
const RECENT_WEEKS_LENGTH = 8;
const TREND_WINDOW = 4;

function getAverage(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);

  return total / scores.length;
}

export function getLastEightWeeks(weeklyScores: HistoryItem[]): HistoryItem[] {
  return weeklyScores.slice(-RECENT_WEEKS_LENGTH);
}

export function getTrend(weeklyScores: HistoryItem[]): Trend {
  const recentScores = getLastEightWeeks(weeklyScores).map((week) => week.score);

  if (recentScores.length < RECENT_WEEKS_LENGTH) {
    return "stable";
  }

  const firstAverage = getAverage(recentScores.slice(0, TREND_WINDOW));
  const lastAverage = getAverage(recentScores.slice(TREND_WINDOW));

  if (lastAverage < firstAverage) {
    return "improving";
  }

  if (firstAverage === 0) {
    return lastAverage === 0 ? "stable" : "declining";
  }

  const variation = Math.abs(lastAverage - firstAverage) / firstAverage;

  return variation < 0.15 ? "stable" : "declining";
}

export function getDialScoreTone(
  score: number,
): "critical" | "high" | "low" | "mid" {
  if (score <= 3) {
    return "low";
  }

  if (score <= 7) {
    return "mid";
  }

  if (score <= 11) {
    return "high";
  }

  return "critical";
}

export function getBarScoreTone(score: number): "high" | "low" | "mid" {
  if (score <= 3) {
    return "low";
  }

  if (score <= 7) {
    return "mid";
  }

  return "high";
}

export function getCurrentCycleSegments(
  weeklyScores: HistoryItem[],
  currentCycleWeek: number,
): CycleSegment[] {
  const completedScores = weeklyScores.slice(-currentCycleWeek);

  return Array.from({ length: CYCLE_LENGTH }, (_, index) => {
    const weekNumber = index + 1;

    if (weekNumber > currentCycleWeek) {
      return {
        weekNumber,
        score: null,
        state: "future",
      };
    }

    return {
      weekNumber,
      score: completedScores[index]?.score ?? 0,
      state: weekNumber === currentCycleWeek ? "current" : "completed",
    };
  });
}
