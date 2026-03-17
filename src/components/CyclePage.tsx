"use client";

import Link from "next/link";

import CycleDial from "@/components/CycleDial";
import {
  getBarScoreTone,
  getCurrentCycleSegments,
  getLastEightWeeks,
} from "@/lib/utils/cycleStats";
import type { CycleStatsData, HistoryItem, Trend } from "@/types";

type CyclePageProps = {
  currentFocusName: string;
  history: HistoryItem[];
  stats: CycleStatsData;
};

function getBarHeight(score: number, maxScore: number): number {
  if (maxScore <= 0) {
    return 0;
  }

  return Math.round((score / maxScore) * 44);
}

function getTrendCopy(trend: Trend): { color: string; label: string } {
  if (trend === "improving") {
    return {
      color: "var(--cycle-bar-low)",
      label: "En amélioration",
    };
  }

  if (trend === "stable") {
    return {
      color: "var(--cream-dim)",
      label: "Stable",
    };
  }

  return {
    color: "var(--cycle-bar-high)",
    label: "À surveiller",
  };
}

function getBarColor(
  score: number,
  isCurrentWeek: boolean,
): { color: string; opacity: number } {
  if (isCurrentWeek) {
    return {
      color: "var(--gold)",
      opacity: 0.8,
    };
  }

  switch (getBarScoreTone(score)) {
    case "low":
      return {
        color: "var(--cycle-bar-low)",
        opacity: 1,
      };
    case "mid":
      return {
        color: "var(--cream-dim)",
        opacity: 1,
      };
    case "high":
      return {
        color: "var(--cycle-bar-high)",
        opacity: 1,
      };
  }
}

export default function CyclePage({
  currentFocusName,
  history,
  stats,
}: CyclePageProps) {
  const segments = getCurrentCycleSegments(
    stats.weeklyScores,
    stats.currentCycleWeek,
  );
  const recentWeeks = getLastEightWeeks(history);
  const maxRecentScore = recentWeeks.reduce(
    (highestScore, item) => Math.max(highestScore, item.score),
    0,
  );
  const currentWeekStart =
    stats.weeklyScores[stats.weeklyScores.length - 1]?.weekStart ?? "";
  const trendCopy = getTrendCopy(stats.trend);

  return (
    <main
      className="min-h-screen"
      style={{
        padding:
          "max(var(--safe-top), 40px) calc(24px + var(--safe-right)) max(var(--safe-bottom), 36px) calc(24px + var(--safe-left))",
      }}
    >
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p
              className="text-[9px] font-light uppercase tracking-[0.22em]"
              style={{ color: "var(--cream-dim)", fontFamily: "var(--font-body)" }}
            >
              Cycle
            </p>
            <h1
              className="text-[clamp(34px,9vw,42px)] font-light leading-none"
              style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
            >
              Vue du cycle
            </h1>
            <p
              className="text-[10px] font-light"
              style={{ color: "var(--cream-mid)", fontFamily: "var(--font-body)" }}
            >
              Focus actuel · {currentFocusName}
            </p>
          </div>
          <Link
            href="/"
            className="tracker-focus-ring inline-flex rounded-full border px-4 py-2 text-[10px] font-light uppercase tracking-[0.18em]"
            style={{
              borderColor: "var(--gold-line)",
              color: "var(--cream-dim)",
              fontFamily: "var(--font-body)",
              transition:
                "border-color var(--transition-base), color var(--transition-base), background-color var(--transition-base)",
            }}
          >
            Retour
          </Link>
        </header>

        <section className="space-y-6">
          <CycleDial
            currentCycleWeek={stats.currentCycleWeek}
            segments={segments}
          />
        </section>

        <div
          aria-hidden="true"
          className="h-px"
          style={{ background: "var(--gold-line)" }}
        />

        <section className="space-y-3">
          <p
            className="text-[9px] font-light uppercase tracking-[0.2em]"
            style={{ color: "var(--cream-dim)", fontFamily: "var(--font-body)" }}
          >
            Vertu la plus difficile
          </p>
          <h2
            className="text-[clamp(28px,7vw,36px)] font-light leading-none"
            style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
          >
            {stats.hardestVirtue.nameFr}
          </h2>
          <p
            className="text-[10px] font-light"
            style={{ color: "var(--cream-dim)", fontFamily: "var(--font-body)" }}
          >
            {stats.hardestVirtue.totalMarks} manquements sur {stats.weeklyScores.length} semaines
          </p>
        </section>

        <div
          aria-hidden="true"
          className="h-px"
          style={{ background: "var(--gold-line)" }}
        />

        <section className="space-y-5">
          <p
            className="text-[9px] font-light uppercase tracking-[0.2em]"
            style={{ color: "var(--cream-dim)", fontFamily: "var(--font-body)" }}
          >
            8 dernières semaines
          </p>

          <div className="flex items-end justify-between gap-3">
            {recentWeeks.map((week, index) => {
              const isCurrentWeek = week.weekStart === currentWeekStart;
              const barColor = getBarColor(week.score, isCurrentWeek);

              return (
                <div
                  key={week.weekStart}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-[56px] items-end">
                    <span
                      className="w-5 rounded-t-[6px]"
                      style={{
                        height: `${getBarHeight(week.score, maxRecentScore)}px`,
                        backgroundColor: barColor.color,
                        opacity: barColor.opacity,
                        transition:
                          "height var(--transition-base), background-color var(--transition-base), opacity var(--transition-base)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[7px] font-light uppercase tracking-[0.14em]"
                    style={{
                      color: "var(--cream-dim)",
                      fontFamily: "var(--font-body)",
                      opacity: 0.5,
                    }}
                  >
                    {`S${index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: trendCopy.color }}
            />
            <p
              className="text-[10px] font-light"
              style={{ color: "var(--cream-mid)", fontFamily: "var(--font-body)" }}
            >
              {trendCopy.label}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
