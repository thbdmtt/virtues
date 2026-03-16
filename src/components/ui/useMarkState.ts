"use client";

import { useEffect, useState } from "react";

import type { CellState } from "@/types";

import { getActionLabel } from "./virtueCellStyles";

export type MarkChange = "idle" | "mark" | "clear";

type UseMarkStateOptions = {
  date: string;
  virtueId: number;
  state: CellState;
  isInteractive?: boolean;
};

type MarkApiSuccess = {
  data: {
    date: string;
    virtueId: number;
    newState: CellState;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCellState(value: unknown): value is CellState {
  return value === "empty" || value === "clean" || value === "marked";
}

function isMarkApiSuccess(value: unknown): value is MarkApiSuccess {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;

  if (!isRecord(data)) {
    return false;
  }

  return (
    typeof data.date === "string" &&
    typeof data.virtueId === "number" &&
    isCellState(data.newState)
  );
}

function getOptimisticState(state: CellState): CellState {
  return state === "marked" ? "empty" : "marked";
}

export function useMarkState({
  date,
  virtueId,
  state,
  isInteractive = true,
}: UseMarkStateOptions) {
  const [cellState, setCellState] = useState<CellState>(state);
  const [isPending, setIsPending] = useState(false);
  const [changeKind, setChangeKind] = useState<MarkChange>("idle");
  const [previousState, setPreviousState] = useState<CellState>(state);

  useEffect(() => {
    setCellState(state);
  }, [state]);

  useEffect(() => {
    if (previousState === cellState) {
      return;
    }

    if (previousState !== "marked" && cellState === "marked") {
      setChangeKind("mark");
    } else if (previousState === "marked" && cellState !== "marked") {
      setChangeKind("clear");
    } else {
      setChangeKind("idle");
    }

    setPreviousState(cellState);
  }, [cellState, previousState]);

  async function toggleMark() {
    if (!isInteractive || isPending) {
      return;
    }

    const previousState = cellState;
    const optimisticState = getOptimisticState(previousState);

    setCellState(optimisticState);
    setIsPending(true);

    try {
      const response = await fetch("/api/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          virtueId,
        }),
      });

      const payload: unknown = await response.json();

      if (!response.ok || !isMarkApiSuccess(payload)) {
        throw new Error("Mark API returned an invalid response.");
      }

      setCellState(payload.data.newState);
    } catch (error: unknown) {
      console.error("Mark update failed", error);
      setCellState(previousState);
    } finally {
      setIsPending(false);
    }
  }

  return {
    actionLabel: getActionLabel(cellState),
    cellState,
    changeKind,
    isPending,
    toggleMark,
  };
}
