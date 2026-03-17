"use client";

import { differenceInCalendarWeeks, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { formatDateKey, getNextWeek, getPreviousWeek } from "@/lib/utils/dates";
import { getWeekMarkKey } from "@/lib/utils/marks";
import { buildWeekMarks } from "@/lib/utils/weekMarks";
import type { WeekData } from "@/types";

type WeekApiSuccess = {
  data: WeekData;
};

type UseWeekScreenDataOptions = {
  currentMarks: Record<string, boolean>;
  initialWeekData: WeekData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWeekApiSuccess(value: unknown): value is WeekApiSuccess {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;

  return (
    isRecord(data) &&
    typeof data.weekStart === "string" &&
    typeof data.weekLabel === "string" &&
    Array.isArray(data.weekDays)
  );
}

export default function useWeekScreenData({
  currentMarks,
  initialWeekData,
}: UseWeekScreenDataOptions) {
  const [displayedWeekData, setDisplayedWeekData] = useState(initialWeekData);
  const [displayedMarks, setDisplayedMarks] = useState(
    buildWeekMarks(initialWeekData),
  );
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);
  const currentWeekStart = initialWeekData.weekStart;
  const weeksBack = differenceInCalendarWeeks(
    parseISO(currentWeekStart),
    parseISO(displayedWeekData.weekStart),
    { weekStartsOn: 1 },
  );
  const isCurrentWeek = displayedWeekData.weekStart === currentWeekStart;
  const canGoPrevious = weeksBack < 12;

  useEffect(() => {
    setDisplayedWeekData(initialWeekData);
    setDisplayedMarks(currentMarks);
  }, [currentWeekStart]);

  useEffect(() => {
    if (isCurrentWeek) {
      setDisplayedMarks(currentMarks);
    }
  }, [currentMarks, isCurrentWeek]);

  async function navigateToWeek(weekStartDate: Date) {
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/week?weekStart=${formatDateKey(weekStartDate)}`,
        {
          cache: "no-store",
        },
      );
      const payload: unknown = await response.json();

      if (!response.ok || !isWeekApiSuccess(payload)) {
        throw new Error("Week API returned an invalid payload.");
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setDisplayedWeekData(payload.data);
      setDisplayedMarks(buildWeekMarks(payload.data));
    } catch (error: unknown) {
      console.error("Week navigation failed", error);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  async function goToPreviousWeek() {
    if (!canGoPrevious || isLoading) {
      return;
    }

    await navigateToWeek(getPreviousWeek(parseISO(displayedWeekData.weekStart)));
  }

  async function goToNextWeek() {
    if (isCurrentWeek || isLoading) {
      return;
    }

    const nextWeekStart = getNextWeek(parseISO(displayedWeekData.weekStart));

    if (formatDateKey(nextWeekStart) === currentWeekStart) {
      setDisplayedWeekData(initialWeekData);
      setDisplayedMarks(currentMarks);
      return;
    }

    await navigateToWeek(nextWeekStart);
  }

  function setDisplayedMark(virtueId: number, dayIdx: number, isMarked: boolean) {
    const markKey = getWeekMarkKey(virtueId, dayIdx);

    setDisplayedMarks((previousMarks) => ({
      ...previousMarks,
      [markKey]: isMarked,
    }));
  }

  return {
    canGoPrevious,
    displayedMarks,
    displayedWeekData,
    goToNextWeek,
    goToPreviousWeek,
    isCurrentWeek,
    isLoading,
    setDisplayedMark,
  };
}
