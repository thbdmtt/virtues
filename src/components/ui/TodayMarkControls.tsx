"use client";

import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef } from "react";

import { getWeekMarkKey } from "@/lib/utils/marks";

type TodayMarkControlsProps = {
  virtueId: number;
  isMarkedToday: boolean;
  weekMarks: Record<string, boolean>;
  todayIndex: number;
  onToggleMark: (virtueId: number, dayIdx: number) => void;
};

const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const PIP_MAX_WIDTH = "28px";

export default function TodayMarkControls({
  virtueId,
  isMarkedToday,
  weekMarks,
  todayIndex,
  onToggleMark,
}: TodayMarkControlsProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const circleControls = useAnimationControls();
  const glowControls = useAnimationControls();
  const previousMarkedRef = useRef(isMarkedToday);

  useEffect(() => {
    const wasMarked = previousMarkedRef.current;

    if (wasMarked === isMarkedToday) {
      return;
    }

    previousMarkedRef.current = isMarkedToday;

    if (shouldReduceMotion) {
      void circleControls.start({
        scale: 1,
        transition: { duration: 0.15, ease: "easeOut" },
      });
      void glowControls.start({
        opacity: isMarkedToday ? 0.65 : 0,
        transition: { duration: 0.15, ease: "easeOut" },
      });
      return;
    }

    if (isMarkedToday) {
      void circleControls.start({
        scale: [1, 1.22, 0.94, 1.06, 1],
        transition: {
          duration: 0.35,
          ease: "easeOut",
          times: [0, 0.24, 0.55, 0.82, 1],
        },
      });
      void glowControls.start({
        opacity: [0.2, 1, 0.7],
        transition: {
          duration: 0.35,
          ease: "easeOut",
          times: [0, 0.5, 1],
        },
      });
      return;
    }

    void circleControls.start({
      scale: [1, 0.9, 1],
      transition: { duration: 0.2, ease: "easeOut", times: [0, 0.45, 1] },
    });
    void glowControls.start({
      opacity: [0.7, 0],
      transition: { duration: 0.15, ease: "easeOut", times: [0, 1] },
    });
  }, [circleControls, glowControls, isMarkedToday, shouldReduceMotion]);

  return (
    <>
      <div className="mt-12 flex items-center gap-5">
        <div className="relative h-14 w-14">
          <motion.button
            type="button"
            aria-label={
              isMarkedToday ? "Annuler le manquement du jour" : "Marquer un manquement aujourd'hui"
            }
            aria-pressed={isMarkedToday}
            animate={circleControls}
            onClick={() => onToggleMark(virtueId, todayIndex)}
            className="tracker-focus-ring relative flex h-14 w-14 items-center justify-center rounded-full border"
            style={{
              borderColor: isMarkedToday
                ? "var(--fault)"
                : "color-mix(in srgb, var(--cream) 15%, transparent)",
              backgroundColor: isMarkedToday
                ? "color-mix(in srgb, var(--fault) 12%, transparent)"
                : "transparent",
              boxShadow: isMarkedToday ? "0 0 20px var(--fault-glow)" : "none",
              transition:
                "border-color var(--transition-base), background-color var(--transition-base), box-shadow var(--transition-base)",
            }}
          >
            <motion.span
              aria-hidden="true"
              animate={glowControls}
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 20px var(--fault-glow)", opacity: 0 }}
            />
            <motion.span
              aria-hidden="true"
              animate={{
                scale: isMarkedToday ? 1 : 0,
                opacity: isMarkedToday ? 1 : 0,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.15, ease: "easeOut" }
                  : { type: "spring", stiffness: 420, damping: 26, mass: 0.5 }
              }
              className="h-[10px] w-[10px] rounded-full"
              style={{ backgroundColor: "var(--fault)" }}
            />
          </motion.button>
        </div>
        <p
          className="text-[11px] font-light uppercase tracking-[0.15em]"
          style={{ color: "var(--cream-dim)" }}
        >
          {isMarkedToday ? "Annuler" : "Manquement aujourd'hui"}
        </p>
      </div>

      <div className="mt-12 flex gap-2">
        {DAY_LABELS.map((label, dayIdx) => {
          const isToday = dayIdx === todayIndex;
          const isFuture = dayIdx > todayIndex;
          const isMarked = Boolean(weekMarks[getWeekMarkKey(virtueId, dayIdx)]);

          return (
            <div
              key={`${virtueId}:${label}`}
              className="flex-1"
              style={{ maxWidth: PIP_MAX_WIDTH }}
            >
              <p
                className="mb-2 text-center text-[8px] font-light uppercase tracking-[0.12em]"
                style={{
                  color: isToday ? "var(--gold)" : "var(--cream-dim)",
                  opacity: isToday ? 0.9 : 0.45,
                }}
              >
                {label}
              </p>
              <button
                type="button"
                aria-label={`Basculer le jour ${label}`}
                onClick={() => onToggleMark(virtueId, dayIdx)}
                disabled={isFuture}
                className="tracker-focus-ring relative mx-auto flex h-7 w-7 items-center justify-center rounded-full border"
                style={{
                  opacity: isFuture ? 0.2 : 1,
                  pointerEvents: isFuture ? "none" : "auto",
                  borderColor: isMarked
                    ? "color-mix(in srgb, var(--fault) 50%, transparent)"
                    : isToday
                      ? "var(--gold-soft)"
                      : "color-mix(in srgb, var(--gold) 12%, transparent)",
                  backgroundColor: isMarked
                    ? "color-mix(in srgb, var(--fault) 20%, transparent)"
                    : "transparent",
                  boxShadow: isToday ? "0 0 8px var(--gold-trace)" : "none",
                  transition:
                    "opacity var(--transition-base), border-color var(--transition-base), background-color var(--transition-base), box-shadow var(--transition-base)",
                }}
              >
                <motion.span
                  aria-hidden="true"
                  animate={{
                    scale: isMarked ? 1 : 0,
                    opacity: isMarked ? 1 : 0,
                  }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.15, ease: "easeOut" }
                      : { type: "spring", stiffness: 380, damping: 24, mass: 0.45 }
                  }
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "var(--fault)" }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
