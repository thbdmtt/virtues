"use client";

import {
  startTransition,
  useEffect,
  useRef,
  type TouchEvent,
  type UIEvent,
  type WheelEvent,
} from "react";
import { motion, type Transition, useReducedMotion } from "framer-motion";

import VirtuePageCard from "@/components/VirtuePageCard";
import type { CellState, DayData, Virtue } from "@/types";

type WeekGridProps = {
  virtues: Virtue[];
  weekDays: DayData[];
  entries: Record<string, CellState>;
  focusVirtueId: number;
  currentPageIndex: number;
  onPageIndexChange: (nextIndex: number) => void;
  onSwipePageChange: (nextIndex: number) => void;
};

const CARD_TRANSITION = {
  duration: 0.28,
  ease: "easeOut",
} satisfies Transition;

const SCROLL_TOLERANCE = 12;

function clampPageIndex(index: number, pageCount: number): number {
  return Math.min(Math.max(index, 0), Math.max(pageCount - 1, 0));
}

function getScrollPageIndex(
  scrollTop: number,
  viewportHeight: number,
  pageCount: number,
): number {
  if (viewportHeight <= 0) {
    return 0;
  }

  return clampPageIndex(Math.round(scrollTop / viewportHeight), pageCount);
}

export default function WeekGrid({
  virtues,
  weekDays,
  entries,
  focusVirtueId,
  currentPageIndex,
  onPageIndexChange,
  onSwipePageChange,
}: WeekGridProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const hasPendingSwipeRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const targetTop = scroller.clientHeight * currentPageIndex;

    if (Math.abs(scroller.scrollTop - targetTop) <= SCROLL_TOLERANCE) {
      return;
    }

    scroller.scrollTo({
      top: targetTop,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [currentPageIndex, shouldReduceMotion]);

  function registerTouchIntent(_event: TouchEvent<HTMLDivElement>) {
    hasPendingSwipeRef.current = true;
  }

  function registerWheelIntent(_event: WheelEvent<HTMLDivElement>) {
    hasPendingSwipeRef.current = true;
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const nextIndex = getScrollPageIndex(
      event.currentTarget.scrollTop,
      event.currentTarget.clientHeight,
      virtues.length,
    );

    if (nextIndex === currentPageIndex) {
      return;
    }

    if (hasPendingSwipeRef.current) {
      hasPendingSwipeRef.current = false;
      startTransition(() => {
        onSwipePageChange(nextIndex);
      });
      return;
    }

    startTransition(() => {
      onPageIndexChange(nextIndex);
    });
  }

  return (
    <div className="h-full min-h-0">
      <div
        ref={scrollerRef}
        aria-label="Parcours vertical des treize vertus"
        onScroll={handleScroll}
        onTouchStart={registerTouchIntent}
        onWheel={registerWheelIntent}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain pr-1"
        style={{
          scrollbarGutter: "stable",
          scrollBehavior: shouldReduceMotion ? "auto" : "smooth",
        }}
      >
        {virtues.map((virtue, index) => (
          <motion.section
            key={`${virtue.id}:${index}`}
            aria-label={`${virtue.nameFr} · page ${index + 1} sur ${virtues.length}`}
            className="flex h-full min-h-full snap-start py-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...CARD_TRANSITION,
              delay: index * 0.03,
            }}
            style={{ scrollSnapStop: "always" }}
          >
            <VirtuePageCard
              virtue={virtue}
              weekDays={weekDays}
              entries={entries}
              isFocus={virtue.id === focusVirtueId}
              pageIndex={index}
              pageCount={virtues.length}
            />
          </motion.section>
        ))}
      </div>
    </div>
  );
}
