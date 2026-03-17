"use client";

import { useRouter } from "next/navigation";

import CycleDial from "@/components/CycleDial";
import {
  getBarScoreTone,
  getCurrentCycleSegments,
  getLastEightWeeks,
} from "@/lib/utils/cycleStats";
import type { CycleStatsData, HistoryItem, Trend } from "@/types";

type CyclePageProps = {
  history: HistoryItem[];
  stats: CycleStatsData;
};

function getBarHeight(
  score: number,
  maxScore: number,
  hasOnlyZeroScores: boolean,
): number {
  if (hasOnlyZeroScores) {
    return 4;
  }

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
  hasOnlyZeroScores: boolean,
): { color: string; opacity: number } {
  if (hasOnlyZeroScores) {
    return {
      color: "var(--cream-dim)",
      opacity: 0.15,
    };
  }

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
  history,
  stats,
}: CyclePageProps) {
  const router = useRouter();
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
  const hasOnlyZeroScores = recentWeeks.every((week) => week.score === 0);
  const hasHardestVirtueData = stats.hardestVirtue.totalMarks > 0;

  return (
    <main
      className="min-h-screen"
      style={{
        padding:
          "calc(var(--safe-top) + 20px) calc(28px + var(--safe-right)) calc(var(--safe-bottom) + 28px) calc(28px + var(--safe-left))",
      }}
    >
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="tracker-focus-ring text-[11px] font-light hover:opacity-90"
            style={{
              color: "var(--cream-dim)",
              fontFamily: "var(--font-body)",
              opacity: 0.5,
              transition: "opacity var(--transition-base)",
            }}
          >
            ←
          </button>
          <p
            className="text-[12px] font-light italic"
            style={{
              color: "var(--cream-dim)",
              fontFamily: "var(--font-display)",
              opacity: 0.6,
            }}
          >
            Semaine {stats.currentCycleWeek} · 13
          </p>
        </header>

        <section>
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
          {hasHardestVirtueData ? (
            <>
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
            </>
          ) : (
            <p
              className="text-[10px] font-light italic"
              style={{
                color: "var(--cream-dim)",
                fontFamily: "var(--font-body)",
                opacity: 0.5,
              }}
            >
              Données insuffisantes
            </p>
          )}
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
              const barColor = getBarColor(
                week.score,
                isCurrentWeek,
                hasOnlyZeroScores,
              );

              return (
                <div
                  key={week.weekStart}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-[56px] items-end">
                    <span
                      className="w-5 rounded-t-[6px]"
                      style={{
                        height: `${getBarHeight(
                          week.score,
                          maxRecentScore,
                          hasOnlyZeroScores,
                        )}px`,
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
