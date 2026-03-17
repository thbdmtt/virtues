"use client";

type MarkApiSuccess = {
  data: {
    date: string;
    virtueId: number;
    newState: "empty" | "clean" | "marked";
  };
};

type ToggleMarkOptions = {
  date: string | undefined;
  dayIdx: number;
  previousMarked: boolean;
  setCurrentMark: (virtueId: number, dayIdx: number, isMarked: boolean) => void;
  setDisplayedMark: (virtueId: number, dayIdx: number, isMarked: boolean) => void;
  syncCurrentWeek: boolean;
  virtueId: number;
};

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

export default function useMarkMutation() {
  return async function toggleMark({
    date,
    dayIdx,
    previousMarked,
    setCurrentMark,
    setDisplayedMark,
    syncCurrentWeek,
    virtueId,
  }: ToggleMarkOptions) {
    if (!date) {
      return;
    }

    const optimisticMarked = !previousMarked;

    setDisplayedMark(virtueId, dayIdx, optimisticMarked);

    if (syncCurrentWeek) {
      setCurrentMark(virtueId, dayIdx, optimisticMarked);
    }

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

      setDisplayedMark(virtueId, dayIdx, resolvedMarked);

      if (syncCurrentWeek) {
        setCurrentMark(virtueId, dayIdx, resolvedMarked);
      }
    } catch (error: unknown) {
      console.error("Screen state mark update failed", error);

      setDisplayedMark(virtueId, dayIdx, previousMarked);

      if (syncCurrentWeek) {
        setCurrentMark(virtueId, dayIdx, previousMarked);
      }
    }
  };
}
