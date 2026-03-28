"use client";

import { parseISO } from "date-fns";
import {
  useEffect,
  useRef,
  useState,
  type TouchEvent,
  type WheelEvent,
} from "react";

import MenuPanel from "@/components/MenuPanel";
import ScreenToday from "@/components/ScreenToday";
import ScreenWeek from "@/components/ScreenWeek";
import useCalendarRefresh from "@/components/useCalendarRefresh";
import useMarkMutation from "@/components/useMarkMutation";
import useWeekScreenData from "@/components/useWeekScreenData";
import MenuButton from "@/components/ui/MenuButton";
import { PWA_APP_NAME } from "@/lib/theme/pwa";
import { countMarkedEntries, getWeekMarkKey } from "@/lib/utils/marks";
import { buildWeekMarks } from "@/lib/utils/weekMarks";
import type { WeekData } from "@/types";

type AppShellProps = {
  initialWeekData: WeekData;
  vapidPublicKey: string | null;
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

function getWeekScrollContainer(target: EventTarget | null): HTMLElement | null {
  if (!isElement(target)) {
    return null;
  }

  const scrollContainer = target.closest("[data-week-scroll='true']");

  return scrollContainer instanceof HTMLElement ? scrollContainer : null;
}

export default function AppShell({
  initialWeekData,
  vapidPublicKey,
}: AppShellProps) {
  useCalendarRefresh();

  const [menuOpen, setMenuOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);
  const [currentMarks, setCurrentMarks] = useState(
    buildWeekMarks(initialWeekData),
  );
  const [swipeCount, setSwipeCount] = useState(0);
  const touchStartRef = useRef<TouchStartPoint | null>(null);
  const toggleMark = useMarkMutation();
  const currentWeekDates = initialWeekData.weekDays.map((day) => day.date);
  const {
    canGoPrevious,
    displayedMarks,
    displayedWeekData,
    goToNextWeek,
    goToPreviousWeek,
    isCurrentWeek,
    isLoading,
    setDisplayedMark,
  } = useWeekScreenData({
    currentMarks,
    initialWeekData,
  });
  const displayedWeekDays = displayedWeekData.weekDays.map((day) =>
    parseISO(day.date),
  );
  const displayedWeekScore = countMarkedEntries(displayedMarks);

  useEffect(() => {
    setCurrentMarks(buildWeekMarks(initialWeekData));
    setWeekOpen(false);
    setMenuOpen(false);
  }, [initialWeekData.weekStart]);

  function setCurrentMark(virtueId: number, dayIdx: number, isMarked: boolean) {
    const markKey = getWeekMarkKey(virtueId, dayIdx);

    setCurrentMarks((previousMarks) => ({
      ...previousMarks,
      [markKey]: isMarked,
    }));
  }

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

  async function handleTodayToggleMark(virtueId: number, dayIdx: number) {
    const previousMarked = Boolean(
      currentMarks[getWeekMarkKey(virtueId, dayIdx)],
    );

    await toggleMark({
      date: currentWeekDates[dayIdx],
      dayIdx,
      previousMarked,
      setCurrentMark,
      setDisplayedMark,
      syncCurrentWeek: true,
      virtueId,
    });
  }

  async function handleWeekToggleMark(virtueId: number, dayIdx: number) {
    const previousMarked = Boolean(
      displayedMarks[getWeekMarkKey(virtueId, dayIdx)],
    );
    const displayedWeekDates = displayedWeekData.weekDays.map((day) => day.date);

    await toggleMark({
      date: displayedWeekDates[dayIdx],
      dayIdx,
      previousMarked,
      setCurrentMark,
      setDisplayedMark,
      syncCurrentWeek: isCurrentWeek,
      virtueId,
    });
  }

  return (
    <>
      <main
        className="fixed inset-0 flex flex-col"
        style={{ background: "var(--app-shell-bg)" }}
      >
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
            {PWA_APP_NAME.toUpperCase()}
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
            virtue={initialWeekData.virtueFocus}
            focusWeekNum={initialWeekData.virtueFocus.weekNumber}
            vapidPublicKey={vapidPublicKey}
            weekMarks={currentMarks}
            onToggleMark={handleTodayToggleMark}
            isWeekOpen={weekOpen}
            isSwipeHintHidden={swipeCount > 0}
          />
          <ScreenWeek
            virtues={displayedWeekData.virtues}
            focusId={displayedWeekData.virtueFocus.id}
            weekDays={displayedWeekDays}
            marks={displayedMarks}
            weekScore={displayedWeekScore}
            weekRange={displayedWeekData.weekLabel}
            canGoPrevious={canGoPrevious}
            isCurrentWeek={isCurrentWeek}
            isLoading={isLoading}
            isOpen={weekOpen}
            onNextWeek={goToNextWeek}
            onPreviousWeek={goToPreviousWeek}
            onToggle={handleWeekToggleMark}
            onClose={closeWeek}
          />
        </div>
      </main>

      <MenuPanel
        virtues={initialWeekData.virtues}
        focusId={initialWeekData.virtueFocus.id}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
