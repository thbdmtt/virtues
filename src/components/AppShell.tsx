"use client";

import { parseISO } from "date-fns";
import { useEffect, useRef, useState, type TouchEvent, type WheelEvent } from "react";

import MenuPanel from "@/components/MenuPanel";
import ScreenToday from "@/components/ScreenToday";
import ScreenWeek from "@/components/ScreenWeek";
import MenuButton from "@/components/ui/MenuButton";
import { countMarkedEntries, getWeekMarkKey } from "@/lib/utils/marks";
import type { Virtue } from "@/types";

type AppShellProps = {
  virtues: Virtue[];
  focusVirtue: Virtue;
  focusWeekNum: number;
  initialMarks: Record<string, boolean>;
  isTodayComplete: boolean;
  weekDates: string[];
  weekLabel: string;
};

type MarkApiSuccess = {
  data: {
    date: string;
    virtueId: number;
    newState: "empty" | "clean" | "marked";
  };
};

type TouchStartPoint = {
  x: number;
  y: number;
  target: EventTarget | null;
};

const SWIPE_THRESHOLD = 44;

function isElement(value: EventTarget | null): value is Element {
  return value instanceof Element;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMarkApiSuccess(value: unknown): value is MarkApiSuccess {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;

  return (
    isRecord(data) &&
    typeof data.date === "string" &&
    typeof data.virtueId === "number" &&
    (data.newState === "empty" ||
      data.newState === "clean" ||
      data.newState === "marked")
  );
}

function getWeekScrollContainer(target: EventTarget | null): HTMLElement | null {
  if (!isElement(target)) {
    return null;
  }

  const scrollContainer = target.closest("[data-week-scroll='true']");

  return scrollContainer instanceof HTMLElement ? scrollContainer : null;
}

export default function AppShell({
  virtues,
  focusVirtue,
  focusWeekNum,
  initialMarks,
  isTodayComplete,
  weekDates,
  weekLabel,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);
  const [marks, setMarks] = useState(initialMarks);
  const [swipeCount, setSwipeCount] = useState(0);
  const touchStartRef = useRef<TouchStartPoint | null>(null);
  const weekDays = weekDates.map((date) => parseISO(date));
  const currentWeekScore = countMarkedEntries(marks);

  useEffect(() => {
    setMarks(initialMarks);
    setWeekOpen(false);
    setMenuOpen(false);
  }, [initialMarks, weekDates]);

  function openWeek() {
    setWeekOpen(true);
  }

  function closeWeek() {
    setWeekOpen(false);
  }

  function handleScreensTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (menuOpen) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      target: event.target,
    };
  }

  function handleScreensTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startPoint = touchStartRef.current;
    const touch = event.changedTouches[0];

    touchStartRef.current = null;

    if (menuOpen || !startPoint || !touch) {
      return;
    }

    const deltaX = startPoint.x - touch.clientX;
    const deltaY = startPoint.y - touch.clientY;

    if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) <= SWIPE_THRESHOLD) {
      return;
    }

    if (deltaY > 0 && !weekOpen) {
      openWeek();
      setSwipeCount((count) => count + 1);
      return;
    }

    const weekScrollContainer = getWeekScrollContainer(startPoint.target);

    if (deltaY < 0 && weekOpen && (!weekScrollContainer || weekScrollContainer.scrollTop <= 0)) {
      closeWeek();
      setSwipeCount((count) => count + 1);
    }
  }

  function handleScreensWheel(event: WheelEvent<HTMLDivElement>) {
    if (menuOpen) {
      return;
    }

    if (!weekOpen && event.deltaY > 20) {
      openWeek();
      return;
    }

    const weekScrollContainer = getWeekScrollContainer(event.target);

    if (weekOpen && event.deltaY < -20 && (!weekScrollContainer || weekScrollContainer.scrollTop <= 0)) {
      closeWeek();
    }
  }

  async function handleToggleMark(virtueId: number, dayIdx: number) {
    const date = weekDates[dayIdx];

    if (!date) {
      return;
    }

    const markKey = getWeekMarkKey(virtueId, dayIdx);
    const previousMarked = Boolean(marks[markKey]);
    const optimisticMarked = !previousMarked;

    setMarks((previousState) => ({
      ...previousState,
      [markKey]: optimisticMarked,
    }));

    try {
      const response = await fetch("/api/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, virtueId }),
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isMarkApiSuccess(payload)) {
        throw new Error("Mark API returned an invalid response.");
      }

      const resolvedMarked = payload.data.newState === "marked";

      setMarks((previousState) => ({
        ...previousState,
        [markKey]: resolvedMarked,
      }));
    } catch (error: unknown) {
      console.error("Screen state mark update failed", error);

      setMarks((previousState) => ({
        ...previousState,
        [markKey]: previousMarked,
      }));
    }
  }

  return (
    <>
      <main className="fixed inset-0 flex flex-col">
        <header
          className="absolute left-0 right-0 top-0 z-40 flex items-start justify-between"
          style={{
            padding:
              "max(var(--safe-top), 52px) calc(28px + var(--safe-right)) 0 calc(28px + var(--safe-left))",
          }}
        >
          <p
            className="text-[10px] font-light uppercase tracking-[0.35em]"
            style={{ color: "var(--cream-dim)" }}
          >
            Franklin
          </p>
          <MenuButton isOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />
        </header>

        <div
          className="relative flex-1 overflow-hidden"
          onTouchStart={handleScreensTouchStart}
          onTouchEnd={handleScreensTouchEnd}
          onWheel={handleScreensWheel}
        >
          <ScreenToday
            virtue={focusVirtue}
            focusWeekNum={focusWeekNum}
            weekMarks={marks}
            onToggleMark={handleToggleMark}
            isTodayComplete={isTodayComplete}
            isWeekOpen={weekOpen}
            isSwipeHintHidden={swipeCount > 0}
          />
          <ScreenWeek
            virtues={virtues}
            focusId={focusVirtue.id}
            weekDays={weekDays}
            marks={marks}
            weekScore={currentWeekScore}
            weekRange={weekLabel}
            isOpen={weekOpen}
            onToggle={handleToggleMark}
            onClose={closeWeek}
          />
        </div>
      </main>

      <MenuPanel
        virtues={virtues}
        focusId={focusVirtue.id}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
