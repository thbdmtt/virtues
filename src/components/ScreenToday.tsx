"use client";

import { format, getISODay } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, useReducedMotion } from "framer-motion";

import NotificationSetup from "@/components/NotificationSetup";
import TodayMarkControls from "@/components/ui/TodayMarkControls";
import { getWeekMarkKey } from "@/lib/utils/marks";
import type { Virtue } from "@/types";

type ScreenTodayProps = {
  virtue: Virtue;
  focusWeekNum: number;
  vapidPublicKey: string | null;
  weekMarks: Record<string, boolean>;
  onToggleMark: (virtueId: number, dayIdx: number) => void;
  isWeekOpen: boolean;
  isSwipeHintHidden: boolean;
};

const SCREEN_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function getTodayIndex(): number {
  return getISODay(new Date()) - 1;
}

function getFocusDateLabel(): string {
  return format(new Date(), "EEE d", { locale: fr })
    .replace(".", "")
    .toUpperCase();
}

export default function ScreenToday({
  virtue,
  focusWeekNum,
  vapidPublicKey,
  weekMarks,
  onToggleMark,
  isWeekOpen,
  isSwipeHintHidden,
}: ScreenTodayProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const todayIndex = getTodayIndex();
  const isMarkedToday = Boolean(weekMarks[getWeekMarkKey(virtue.id, todayIndex)]);

  return (
    <motion.section
      initial={false}
      animate={
        shouldReduceMotion
          ? { opacity: isWeekOpen ? 0 : 1 }
          : { opacity: isWeekOpen ? 0 : 1, y: isWeekOpen ? "-100%" : "0%" }
      }
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.6,
        ease: SCREEN_EASE,
      }}
      className="absolute inset-0 flex flex-col justify-end"
      aria-label="Écran du jour"
      aria-hidden={isWeekOpen}
      style={{
        pointerEvents: isWeekOpen ? "none" : "auto",
        padding:
          "max(var(--safe-top), 132px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 48px) calc(28px + var(--safe-left))",
      }}
    >
      <div className="relative flex flex-col justify-end">
        <div>
          <div className="flex items-center gap-2">
            <motion.span
              aria-hidden="true"
              className="h-1 w-1 rounded-full"
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 0.4, 1] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.15, ease: "easeOut" }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
              style={{ backgroundColor: "var(--gold)" }}
            />
            <p
              className="text-[9px] font-light uppercase tracking-[0.35em]"
              style={{
                color: "var(--gold-soft)",
                fontFamily: "var(--font-body)",
              }}
            >
              {`Focus · semaine ${focusWeekNum} · ${getFocusDateLabel()}`}
            </p>
          </div>

          <h1
            className="mt-5 text-[clamp(64px,17vw,88px)] font-light leading-[0.86] tracking-[-0.025em]"
            style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
          >
            {virtue.nameFr}
          </h1>

          <p
            className="mt-4 max-w-[280px] text-[14px] font-light italic"
            style={{
              color: "var(--cream-dim)",
              fontFamily: "var(--font-display)",
              lineHeight: 1.8,
            }}
          >
            {virtue.maxim}
          </p>
        </div>

        <TodayMarkControls
          virtueId={virtue.id}
          isMarkedToday={isMarkedToday}
          weekMarks={weekMarks}
          todayIndex={todayIndex}
          onToggleMark={onToggleMark}
        />

        <NotificationSetup vapidPublicKey={vapidPublicKey} />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[max(var(--safe-bottom),20px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        animate={
          isSwipeHintHidden
            ? { opacity: 0 }
            : shouldReduceMotion
              ? { opacity: 0.5 }
              : { opacity: [0, 0, 0.65, 0.65, 0] }
        }
        transition={
          isSwipeHintHidden
            ? { duration: 0.15, ease: "easeOut" }
            : shouldReduceMotion
              ? { duration: 0.15, ease: "easeOut" }
              : {
                  duration: 5,
                  delay: 2,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.35, 0.75, 1],
                }
        }
      >
        <span
          className="block w-px"
          style={{
            height: "18px",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--gold) 65%, transparent), transparent)",
          }}
        />
        <span
          className="text-[7px] font-light uppercase tracking-[0.3em]"
          style={{ color: "var(--cream-dim)" }}
        >
          Semaine
        </span>
      </motion.div>
    </motion.section>
  );
}
