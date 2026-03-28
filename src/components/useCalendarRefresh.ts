"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  formatDateKey,
  getMillisecondsUntilNextDay,
} from "@/lib/utils/dates";

const CALENDAR_REFRESH_BUFFER_MS = 1000;

export default function useCalendarRefresh() {
  const router = useRouter();
  const lastRenderedDateKeyRef = useRef(formatDateKey(new Date()));

  useEffect(() => {
    let timeoutId: number | null = null;

    function syncDateKey() {
      lastRenderedDateKeyRef.current = formatDateKey(new Date());
    }

    function refreshIfCalendarChanged() {
      const currentDateKey = formatDateKey(new Date());

      if (currentDateKey === lastRenderedDateKeyRef.current) {
        return;
      }

      lastRenderedDateKeyRef.current = currentDateKey;
      router.refresh();
    }

    function scheduleNextRefresh() {
      const delay =
        getMillisecondsUntilNextDay(new Date()) + CALENDAR_REFRESH_BUFFER_MS;

      timeoutId = window.setTimeout(() => {
        refreshIfCalendarChanged();
        scheduleNextRefresh();
      }, delay);
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        return;
      }

      refreshIfCalendarChanged();
    }

    function handleFocus() {
      refreshIfCalendarChanged();
    }

    syncDateKey();
    scheduleNextRefresh();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);
}
