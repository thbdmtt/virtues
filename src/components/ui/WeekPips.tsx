"use client";

import { isBefore, isToday, parseISO, startOfDay } from "date-fns";

import type { CellState, DayData } from "@/types";

import { useMarkMotion } from "./useMarkMotion";
import { useMarkState } from "./useMarkState";

type WeekPipsProps = {
  weekDays: DayData[];
  entries: Record<string, CellState>;
  virtueId: number;
};

type DayTiming = "past" | "today" | "future";

type WeekPipProps = {
  date: string;
  dayTiming: DayTiming;
  state: CellState;
  virtueId: number;
};

function getEntryKey(date: string, virtueId: number): string {
  return `${date}:${virtueId}`;
}

function getDayTiming(date: string, today: Date): DayTiming {
  const parsedDate = parseISO(date);

  if (isToday(parsedDate)) {
    return "today";
  }

  if (isBefore(parsedDate, today)) {
    return "past";
  }

  return "future";
}

function getPipBorderColor(dayTiming: DayTiming, state: CellState): string {
  if (dayTiming === "today") {
    return "var(--accent-gold)";
  }

  if (state === "marked") {
    return "var(--mark-red)";
  }

  return "var(--border)";
}

function getPipBackgroundColor(state: CellState): string {
  if (state === "marked") {
    return "var(--mark-red)";
  }

  return "transparent";
}

function getPipShadow(state: CellState): string {
  void state;
  return "none";
}

function WeekPip({ date, dayTiming, state, virtueId }: WeekPipProps) {
  const isInteractive = dayTiming !== "future";
  const { actionLabel, cellState, changeKind, isPending, toggleMark } =
    useMarkState({
      date,
      virtueId,
      state,
      isInteractive,
    });
  const isMarked = cellState === "marked";
  const { glowRef, shellRef, shouldReduceMotion } = useMarkMotion({
    changeKind,
    glowShadow: "0 0 8px var(--mark-red-glow)",
    isMarked,
  });

  const shouldPulse =
    dayTiming === "today" &&
    cellState !== "marked" &&
    !shouldReduceMotion;
  const resolvedOpacity = (dayTiming === "future" ? 0.2 : 1) * (isPending ? 0.78 : 1);
  const ariaLabel = `${actionLabel} un manquement pour la vertu ${virtueId} le ${date}`;

  if (!isInteractive) {
    return (
      <span
        ref={shellRef}
        aria-hidden="true"
        className="relative block h-3 w-3 rounded-full border"
        style={{
          opacity: resolvedOpacity,
          borderColor: getPipBorderColor(dayTiming, cellState),
          backgroundColor: getPipBackgroundColor(cellState),
          boxShadow: getPipShadow(cellState),
          transition:
            "background-color var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base), opacity var(--transition-base)",
        }}
      >
        <span
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            opacity: isMarked ? 0.5 : 0,
            boxShadow: "0 0 8px var(--mark-red-glow)",
          }}
        />
      </span>
    );
  }

  return (
    <button
      ref={shellRef}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={cellState === "marked"}
      onClick={toggleMark}
      disabled={isPending}
      className={`tracker-focus-ring relative block h-3 w-3 rounded-full border ${
        shouldPulse ? "tracker-pulse" : ""
      }`}
      style={{
        opacity: resolvedOpacity,
        borderColor: getPipBorderColor(dayTiming, cellState),
        backgroundColor: getPipBackgroundColor(cellState),
        boxShadow: getPipShadow(cellState),
        transition:
          "background-color var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base), opacity var(--transition-base)",
      }}
    >
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          opacity: isMarked ? 0.5 : 0,
          boxShadow: "0 0 8px var(--mark-red-glow)",
        }}
      />
    </button>
  );
}

export default function WeekPips({
  weekDays,
  entries,
  virtueId,
}: WeekPipsProps) {
  const today = startOfDay(new Date());

  return (
    <div className="flex items-center gap-[10px]">
      {weekDays.map((day) => (
        <WeekPip
          key={day.date}
          date={day.date}
          dayTiming={getDayTiming(day.date, today)}
          state={entries[getEntryKey(day.date, virtueId)] ?? "empty"}
          virtueId={virtueId}
        />
      ))}
    </div>
  );
}
