"use client";

import { format, isAfter, isSameDay, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, useReducedMotion } from "framer-motion";

import { getWeekMarkKey } from "@/lib/utils/marks";
import type { Virtue } from "@/types";

type ScreenWeekProps = {
  virtues: Virtue[];
  focusId: number;
  weekDays: Date[];
  marks: Record<string, boolean>;
  weekScore: number;
  weekRange: string;
  canGoPrevious: boolean;
  isCurrentWeek: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onNextWeek: () => void;
  onPreviousWeek: () => void;
  onToggle: (virtueId: number, dayIdx: number) => void;
  onClose: () => void;
};

const WEEK_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function getOrderedVirtues(virtues: Virtue[], focusId: number): Virtue[] {
  const focusVirtue = virtues.find((virtue) => virtue.id === focusId);
  const otherVirtues = virtues.filter((virtue) => virtue.id !== focusId);

  return focusVirtue ? [focusVirtue, ...otherVirtues] : virtues;
}

function getDayLabel(day: Date): string {
  return format(day, "EEE", { locale: fr }).replace(".", "").toUpperCase();
}

function getCellLabel(virtueName: string, dayLabel: string, isMarked: boolean): string {
  return isMarked ? `${virtueName}, ${dayLabel}, faute marquée` : `${virtueName}, ${dayLabel}, aucune faute marquée`;
}

function getVirtueLabel(nameFr: string): string {
  return nameFr.length > 7 ? `${nameFr.substring(0, 6)}.` : nameFr;
}

export default function ScreenWeek({
  virtues,
  focusId,
  weekDays,
  marks,
  weekScore,
  weekRange,
  canGoPrevious,
  isCurrentWeek,
  isLoading,
  isOpen,
  onNextWeek,
  onPreviousWeek,
  onToggle,
  onClose,
}: ScreenWeekProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const orderedVirtues = getOrderedVirtues(virtues, focusId);
  const today = startOfDay(new Date());
  const isPreviousDisabled = !canGoPrevious || isLoading;
  const isNextDisabled = isCurrentWeek || isLoading;

  return (
    <motion.section
      aria-label="Écran semaine"
      aria-hidden={!isOpen}
      initial={false}
      animate={
        shouldReduceMotion
          ? { opacity: isOpen ? 1 : 0 }
          : { opacity: isOpen ? 1 : 0, y: isOpen ? "0%" : "100%" }
      }
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.6,
        ease: WEEK_EASE,
      }}
      className="absolute inset-0 z-30 flex flex-col overflow-hidden"
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        padding:
          "max(var(--safe-top), 132px) calc(18px + var(--safe-right)) max(var(--safe-bottom), 24px) calc(18px + var(--safe-left))",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--deep) 96%, transparent), color-mix(in srgb, var(--void) 94%, transparent))",
        backdropFilter: "blur(18px)",
      }}
    >
      <header className="flex items-end justify-between gap-4 px-[10px] pb-4 pt-5">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label="Afficher la semaine précédente"
            onClick={onPreviousWeek}
            disabled={isPreviousDisabled}
            className="tracker-focus-ring h-11 min-w-11 px-2 text-[14px] font-light hover:opacity-50 disabled:hover:opacity-20"
            style={{
              color: "var(--cream-dim)",
              fontFamily: "var(--font-body)",
              opacity: isPreviousDisabled ? 0.2 : 0.34,
              transition: "opacity var(--transition-base)",
            }}
          >
            ←
          </button>
          <p
            className="truncate text-[13px] font-light italic"
            style={{
              color: "var(--cream-mid)",
              fontFamily: "var(--font-display)",
            }}
          >
            {weekRange}
          </p>
          <button
            type="button"
            aria-label="Afficher la semaine suivante"
            onClick={onNextWeek}
            disabled={isNextDisabled}
            className="tracker-focus-ring h-11 min-w-11 px-2 text-[14px] font-light hover:opacity-50 disabled:hover:opacity-20"
            style={{
              color: "var(--cream-dim)",
              fontFamily: "var(--font-body)",
              opacity: isNextDisabled ? 0.2 : 0.34,
              transition: "opacity var(--transition-base)",
            }}
          >
            →
          </button>
        </div>
        <div className="text-right">
          <p
            className="text-[28px] font-light leading-none"
            style={{
              color: "var(--cream)",
              fontFamily: "var(--font-display)",
            }}
          >
            {weekScore}
          </p>
          <p
            className="mt-1 text-[9px] font-light uppercase tracking-[0.15em]"
            style={{ color: "var(--cream-dim)" }}
          >
            fautes
          </p>
        </div>
      </header>

      <div aria-hidden="true" className="mx-[10px] h-px shrink-0" style={{ background: "linear-gradient(to right, var(--gold-line), transparent)" }} />

      <div
        className="grid shrink-0 gap-[3px] px-[10px] pb-3 pt-4"
        style={{ alignItems: "center", gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        <div />
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);

          return (
            <p
              key={day.toISOString()}
              className="text-center text-[8px] font-light uppercase tracking-[0.1em]"
              style={{
                color: isToday ? "var(--gold)" : "var(--cream-dim)",
                opacity: isToday ? 0.9 : 0.5,
              }}
            >
              {getDayLabel(day)}
            </p>
          );
        })}
      </div>

      <div data-week-scroll="true" className="min-h-0 flex-1 overflow-y-auto pb-8">
        <div className="space-y-[6px] px-[10px] pb-10">
          {orderedVirtues.map((virtue) => {
            const isFocus = virtue.id === focusId;

            return (
              <div
                key={virtue.id}
                className="rounded-[18px] px-[10px] py-[8px]"
                style={{
                  background: isFocus
                    ? "color-mix(in srgb, var(--gold) 5%, transparent)"
                    : "color-mix(in srgb, var(--surface) 32%, transparent)",
                  boxShadow: isFocus
                    ? "inset 0 0 0 1px var(--gold-line)"
                    : "inset 0 0 0 1px color-mix(in srgb, var(--cream-line-soft) 70%, transparent)",
                  transition:
                    "background-color var(--transition-base), box-shadow var(--transition-base)",
                }}
              >
                <div className="grid gap-[3px]" style={{ alignItems: "center", gridTemplateColumns: "52px repeat(7, 1fr)" }}>
                  <div style={{ display: "flex", alignItems: "center", paddingRight: "6px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "7px",
                        fontWeight: 300,
                        letterSpacing: "0.08em",
                        color: isFocus ? "var(--gold-soft)" : "var(--cream-dim)",
                        opacity: isFocus ? 0.9 : 0.5,
                        textAlign: "right",
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textTransform: "uppercase",
                      }}
                    >
                      {getVirtueLabel(virtue.nameFr)}
                    </span>
                  </div>
                  {weekDays.map((day, dayIdx) => {
                    const isToday = isSameDay(day, today);
                    const isFuture = isAfter(startOfDay(day), today);
                    const isMarked = Boolean(marks[getWeekMarkKey(virtue.id, dayIdx)]);

                    return (
                      <button
                        key={`${virtue.id}-${day.toISOString()}`}
                        type="button"
                        aria-label={getCellLabel(virtue.nameFr, getDayLabel(day), isMarked)}
                        disabled={isFuture}
                        onClick={() => onToggle(virtue.id, dayIdx)}
                        className="tracker-focus-ring relative h-9 w-full max-w-9 justify-self-center rounded-[12px] border"
                        style={{
                          opacity: isFuture ? 0.2 : 1,
                          pointerEvents: isFuture ? "none" : "auto",
                          borderColor: isMarked
                            ? "color-mix(in srgb, var(--fault) 40%, transparent)"
                            : isToday
                              ? "color-mix(in srgb, var(--gold) 20%, transparent)"
                              : "color-mix(in srgb, var(--gold) 7%, transparent)",
                          background: isMarked
                            ? "color-mix(in srgb, var(--fault) 18%, var(--surface))"
                            : isFocus
                              ? "color-mix(in srgb, var(--surface) 72%, var(--gold-trace))"
                              : "var(--surface)",
                          boxShadow: isToday
                            ? "0 0 10px color-mix(in srgb, var(--gold) 12%, transparent)"
                            : "none",
                          transition:
                            "opacity var(--transition-base), border-color var(--transition-base), background-color var(--transition-base), box-shadow var(--transition-base)",
                        }}
                      >
                        <span className="sr-only">{virtue.nameFr}</span>
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
                          className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            backgroundColor: "var(--fault)",
                            boxShadow: "0 0 10px var(--fault-glow)",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Revenir à l'écran du jour"
        onClick={onClose}
        className="tracker-focus-ring absolute bottom-[max(var(--safe-bottom),12px)] left-1/2 h-11 w-14 -translate-x-1/2"
      >
        <span
          className="mx-auto mt-[18px] block h-1 w-9 rounded-full"
          style={{ background: "color-mix(in srgb, var(--cream) 12%, transparent)" }}
        />
      </button>
    </motion.section>
  );
}
