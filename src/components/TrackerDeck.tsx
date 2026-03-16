"use client";

import { startTransition, useEffect, useState } from "react";

import WeekGrid from "@/components/WeekGrid";
import WeekNav from "@/components/WeekNav";
import type { CellState, DayData, Virtue } from "@/types";

type TrackerDeckProps = {
  weekStart: string;
  virtues: Virtue[];
  weekDays: DayData[];
  entries: Record<string, CellState>;
  virtueFocus: Virtue;
  previousHref: string;
  nextHref: string;
  weekLabel: string;
  weekScore: number;
  cycleLabel: string;
  currentDayLabel: string;
  isCurrentDayComplete: boolean;
  isNextDisabled: boolean;
};

type SwipeDirectionHintProps = {
  currentPageIndex: number;
  pageCount: number;
  isVisible: boolean;
};

function orderVirtues(virtues: Virtue[], focusVirtueId: number): Virtue[] {
  const focusVirtue = virtues.find((virtue) => virtue.id === focusVirtueId);

  if (!focusVirtue) {
    return virtues;
  }

  const remainingVirtues = virtues.filter((virtue) => virtue.id !== focusVirtueId);

  return [focusVirtue, ...remainingVirtues];
}

function SwipeDirectionHint({
  currentPageIndex,
  pageCount,
  isVisible,
}: SwipeDirectionHintProps) {
  const upOpacity = isVisible && currentPageIndex > 0 ? 0.2 : 0;
  const downOpacity = isVisible && currentPageIndex < pageCount - 1 ? 0.2 : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 z-10 flex h-16 -translate-y-1/2 flex-col items-center justify-between"
      style={{
        color: "var(--text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: "10px",
      }}
    >
      <span
        style={{
          opacity: upOpacity,
          transition: "opacity 300ms ease-out",
        }}
      >
        ↑
      </span>
      <span
        style={{
          opacity: downOpacity,
          transition: "opacity 300ms ease-out",
        }}
      >
        ↓
      </span>
    </div>
  );
}

export default function TrackerDeck({
  weekStart,
  virtues,
  weekDays,
  entries,
  virtueFocus,
  previousHref,
  nextHref,
  weekLabel,
  weekScore,
  cycleLabel,
  currentDayLabel,
  isCurrentDayComplete,
  isNextDisabled,
}: TrackerDeckProps) {
  const orderedVirtues = orderVirtues(virtues, virtueFocus.id);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [swipeUsageCount, setSwipeUsageCount] = useState(0);
  const currentVirtue = orderedVirtues[currentPageIndex] ?? virtueFocus;
  const showSwipeHint = swipeUsageCount < 3;

  useEffect(() => {
    setCurrentPageIndex(0);
  }, [weekStart, virtueFocus.id]);

  function handlePageIndexChange(nextIndex: number) {
    setCurrentPageIndex(nextIndex);
  }

  function handleSwipePageChange(nextIndex: number) {
    startTransition(() => {
      setCurrentPageIndex(nextIndex);
      setSwipeUsageCount((count) => Math.min(count + 1, 3));
    });
  }

  function goToPreviousPage() {
    startTransition(() => {
      setCurrentPageIndex((previousIndex) => Math.max(previousIndex - 1, 0));
    });
  }

  function goToNextPage() {
    startTransition(() => {
      setCurrentPageIndex((previousIndex) =>
        Math.min(previousIndex + 1, orderedVirtues.length - 1),
      );
    });
  }

  return (
    <div className="flex h-full min-h-[34rem] flex-col">
      <WeekNav
        previousHref={previousHref}
        nextHref={nextHref}
        weekLabel={weekLabel}
        weekScore={weekScore}
        cycleLabel={cycleLabel}
        currentDayLabel={currentDayLabel}
        isCurrentDayComplete={isCurrentDayComplete}
        isNextDisabled={isNextDisabled}
        currentPageIndex={currentPageIndex}
        pageCount={orderedVirtues.length}
        currentVirtueId={currentVirtue.id}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
      />
      <div className="relative mt-6 min-h-0 flex-1">
        <SwipeDirectionHint
          currentPageIndex={currentPageIndex}
          pageCount={orderedVirtues.length}
          isVisible={showSwipeHint}
        />
        <WeekGrid
          virtues={orderedVirtues}
          weekDays={weekDays}
          entries={entries}
          focusVirtueId={virtueFocus.id}
          currentPageIndex={currentPageIndex}
          onPageIndexChange={handlePageIndexChange}
          onSwipePageChange={handleSwipePageChange}
        />
      </div>
    </div>
  );
}
