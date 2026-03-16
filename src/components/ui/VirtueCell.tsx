"use client";

import { motion } from "framer-motion";

import type { CellState } from "@/types";

import {
  getCompactBackgroundColor,
  getCompactBorderColor,
  getCompactDotColor,
  getCompactShadow,
  getDotOpacity,
  getDotScale,
  getDotShadow,
  getDotSize,
  getTodayBackgroundColor,
  getTodayBorderColor,
  getTodayShadow,
  type VirtueCellMode,
} from "./virtueCellStyles";
import { useMarkMotion } from "./useMarkMotion";
import { useMarkState } from "./useMarkState";

type VirtueCellProps = {
  date: string;
  virtueId: number;
  state: CellState;
  isFocusVirtue: boolean;
  mode?: VirtueCellMode;
  isInteractive?: boolean;
  visualOpacity?: number;
};

type CellDotProps = {
  mode: VirtueCellMode;
  shouldReduceMotion: boolean;
  state: CellState;
};

function CellDot({ mode, shouldReduceMotion, state }: CellDotProps) {
  const dotSize = getDotSize(mode, state);
  const dotColor =
    mode === "today" ? "var(--text-primary)" : getCompactDotColor(state);

  return (
    <motion.span
      aria-hidden="true"
      className="rounded-full"
      initial={false}
      animate={{
        opacity: getDotOpacity(state),
        scale: shouldReduceMotion ? 1 : getDotScale(state),
        boxShadow: getDotShadow(mode, state),
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0.15, ease: "easeOut" }
          : {
              type: "spring",
              stiffness: 440,
              damping: 22,
              mass: 0.55,
            }
      }
      style={{
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        backgroundColor: dotColor,
      }}
    />
  );
}

export default function VirtueCell({
  date,
  virtueId,
  state,
  isFocusVirtue,
  mode = "compact",
  isInteractive = true,
  visualOpacity = 1,
}: VirtueCellProps) {
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
    glowShadow: mode === "today" ? "0 0 16px var(--mark-red-glow)" : "0 0 12px var(--mark-red-glow)",
    isMarked,
  });

  const resolvedOpacity = isPending ? visualOpacity * 0.78 : visualOpacity;
  const ariaLabel = `${actionLabel} un manquement pour la vertu ${virtueId} le ${date}`;

  if (mode === "today") {
    return (
      <div
        className="flex min-h-[74px] w-14 flex-col items-center justify-center gap-1.5"
        style={{
          fontFamily: "var(--font-body)",
          opacity: resolvedOpacity,
          transition: "opacity var(--transition-base)",
        }}
      >
        <motion.button
          ref={shellRef}
          type="button"
          aria-label={ariaLabel}
          aria-pressed={cellState === "marked"}
          data-state={cellState}
          onClick={toggleMark}
          disabled={!isInteractive || isPending}
          whileHover={!isInteractive || isPending ? undefined : { scale: 1.02 }}
          whileTap={!isInteractive || isPending ? undefined : { scale: 0.97 }}
          className="tracker-focus-ring relative flex h-14 w-14 min-h-14 min-w-14 items-center justify-center rounded-full"
          style={{
            borderWidth: "1.5px",
            borderStyle: "solid",
            borderColor: getTodayBorderColor(cellState),
            backgroundColor: getTodayBackgroundColor(cellState),
            boxShadow: getTodayShadow(cellState),
            transition:
              "background-color var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base)",
          }}
        >
          <span
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              opacity: isMarked ? 0.5 : 0,
              boxShadow: "0 0 16px var(--mark-red-glow)",
            }}
          />
          <CellDot
            mode="today"
            shouldReduceMotion={shouldReduceMotion}
            state={cellState}
          />
        </motion.button>
        <span
          className="text-center text-[11px] leading-none"
          style={{
            color: "var(--text-secondary)",
            opacity: 0.6,
          }}
        >
          {actionLabel}
        </span>
      </div>
    );
  }

  if (!isInteractive) {
    return (
      <div
        ref={shellRef}
        aria-hidden="true"
        className="relative flex h-6 w-6 items-center justify-center rounded-full border"
        style={{
          fontFamily: "var(--font-body)",
          opacity: resolvedOpacity,
          backgroundColor: getCompactBackgroundColor(cellState),
          borderColor: getCompactBorderColor(cellState, isFocusVirtue),
          boxShadow: getCompactShadow(cellState, isFocusVirtue),
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
            boxShadow: "0 0 12px var(--mark-red-glow)",
          }}
        />
        <CellDot
          mode="compact"
          shouldReduceMotion={shouldReduceMotion}
          state={cellState}
        />
      </div>
    );
  }

  return (
    <motion.button
      ref={shellRef}
      type="button"
      aria-label={ariaLabel}
      aria-pressed={cellState === "marked"}
      data-state={cellState}
      onClick={toggleMark}
      disabled={isPending}
      whileHover={isPending ? undefined : { y: -1, scale: 1.04 }}
      whileTap={isPending ? undefined : { scale: 0.96 }}
      className="tracker-focus-ring relative flex h-6 w-6 items-center justify-center rounded-full border"
      style={{
        fontFamily: "var(--font-body)",
        opacity: resolvedOpacity,
        backgroundColor: getCompactBackgroundColor(cellState),
        borderColor: getCompactBorderColor(cellState, isFocusVirtue),
        boxShadow: getCompactShadow(cellState, isFocusVirtue),
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
          boxShadow: "0 0 12px var(--mark-red-glow)",
        }}
      />
      <CellDot
        mode="compact"
        shouldReduceMotion={shouldReduceMotion}
        state={cellState}
      />
    </motion.button>
  );
}
