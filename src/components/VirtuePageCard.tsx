import { format, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

import VirtueCell from "@/components/ui/VirtueCell";
import WeekPips from "@/components/ui/WeekPips";
import type { CellState, DayData, Virtue } from "@/types";

type VirtuePageCardProps = {
  virtue: Virtue;
  weekDays: DayData[];
  entries: Record<string, CellState>;
  isFocus: boolean;
  pageIndex: number;
  pageCount: number;
};

type DayTiming = "past" | "today" | "future";

type ReferenceDay = {
  day: DayData;
  timing: DayTiming;
  eyebrow: string;
  label: string;
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

function getVirtueNumberLabel(id: number): string {
  return id.toString().padStart(2, "0");
}

function getCapitalizedDayLabel(date: string): string {
  const label = format(parseISO(date), "EEEE d MMMM", { locale: fr });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getReferenceDay(weekDays: DayData[]): ReferenceDay {
  const today = startOfDay(new Date());
  const todayDay = weekDays.find((day) => getDayTiming(day.date, today) === "today");

  if (todayDay) {
    return {
      day: todayDay,
      timing: "today",
      eyebrow: "Aujourd'hui",
      label: getCapitalizedDayLabel(todayDay.date),
    };
  }

  const pastDays = weekDays.filter((day) => getDayTiming(day.date, today) === "past");

  if (pastDays.length > 0) {
    const lastPastDay = pastDays[pastDays.length - 1];

    return {
      day: lastPastDay,
      timing: "past",
      eyebrow: "Dernier jour",
      label: getCapitalizedDayLabel(lastPastDay.date),
    };
  }

  return {
    day: weekDays[0],
    timing: "future",
    eyebrow: "Semaine à venir",
    label: getCapitalizedDayLabel(weekDays[0].date),
  };
}

function getCardBackground(isFocus: boolean): string {
  if (isFocus) {
    return "linear-gradient(180deg, color-mix(in srgb, var(--accent-gold) 7%, var(--bg-panel-strong)), var(--bg-panel))";
  }

  return "linear-gradient(180deg, color-mix(in srgb, var(--bg-panel-soft) 88%, var(--bg-panel-strong)), var(--bg-panel))";
}

function getCardBorderColor(isFocus: boolean): string {
  if (isFocus) {
    return "color-mix(in srgb, var(--accent-gold) 52%, var(--border-strong))";
  }

  return "var(--border-strong)";
}

function getMetaBackground(isFocus: boolean): string {
  if (isFocus) {
    return "color-mix(in srgb, var(--accent-gold) 5%, var(--bg-panel-soft))";
  }

  return "color-mix(in srgb, var(--bg-panel-soft) 84%, var(--bg-panel))";
}

export default function VirtuePageCard({
  virtue,
  weekDays,
  entries,
  isFocus,
  pageIndex,
  pageCount,
}: VirtuePageCardProps) {
  const referenceDay = getReferenceDay(weekDays);
  const referenceState = entries[getEntryKey(referenceDay.day.date, virtue.id)] ?? "empty";
  const isReferenceInteractive = referenceDay.timing !== "future";

  return (
    <article
      className="relative flex h-full w-full overflow-hidden rounded-[30px] border px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
      style={{
        borderColor: getCardBorderColor(isFocus),
        background: getCardBackground(isFocus),
        boxShadow: "var(--shadow-panel), var(--shadow-inset)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{
          background: isFocus
            ? "linear-gradient(90deg, transparent, var(--overlay-strong), transparent)"
            : "linear-gradient(90deg, transparent, var(--overlay-soft), transparent)",
        }}
      />
      <div className="flex h-full w-full flex-col justify-between gap-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{
                  color: isFocus ? "var(--accent-gold)" : "var(--text-secondary)",
                }}
              >
                {isFocus ? "Vertu de la semaine" : `Vertu ${getVirtueNumberLabel(virtue.id)}`}
              </p>
              <span
                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                style={{
                  borderColor: "var(--border-soft)",
                  color: "var(--text-secondary)",
                  backgroundColor:
                    "color-mix(in srgb, var(--bg-panel-strong) 78%, var(--bg-panel))",
                }}
              >
                {pageIndex + 1}/{pageCount}
              </span>
            </div>
            <div
              style={{
                marginTop: isFocus ? "min(10vh, 48px)" : "1.5rem",
                marginBottom: isFocus ? "min(4vh, 20px)" : "1rem",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{
                  color: isFocus ? "var(--accent-gold)" : "var(--text-secondary)",
                }}
              >
                Franklin {getVirtueNumberLabel(virtue.id)}
              </p>
              <h2
                className={
                  isFocus
                    ? "mt-4 text-[clamp(3.5rem,12vw,6.25rem)] leading-[0.9] tracking-[-0.04em] max-[374px]:text-[clamp(3.1rem,10.8vw,5.6rem)]"
                    : "mt-4 text-[clamp(2.75rem,11vw,3.875rem)] leading-[0.92] tracking-[-0.035em]"
                }
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {virtue.nameFr}
              </h2>
              <p
                className="mt-2 text-sm italic"
                style={{ color: "var(--text-secondary)" }}
              >
                {virtue.nameEn}
              </p>
            </div>
            <p
              className={isFocus ? "max-w-2xl text-lg" : "max-w-xl text-[15px]"}
              style={{
                color: "var(--text-primary)",
                lineHeight: "var(--text-maxim-line-height)",
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: isFocus ? 3 : 2,
              }}
            >
              {virtue.description}
            </p>
          </div>
          <aside
            className="rounded-[24px] border px-5 py-5"
            style={{
              borderColor: "var(--border-soft)",
              backgroundColor: getMetaBackground(isFocus),
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "var(--text-secondary)" }}
            >
              {referenceDay.eyebrow}
            </p>
            <p
              className="mt-3 text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {referenceDay.label}
            </p>
            <div className="mt-6 flex justify-start">
              <VirtueCell
                date={referenceDay.day.date}
                virtueId={virtue.id}
                state={referenceState}
                isFocusVirtue={isFocus}
                mode="today"
                isInteractive={isReferenceInteractive}
                visualOpacity={isReferenceInteractive ? 1 : 0.32}
              />
            </div>
          </aside>
        </div>
        <div
          className="rounded-[24px] border px-5 py-5"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor:
              "color-mix(in srgb, var(--bg-panel-soft) 78%, var(--bg-panel))",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <p
              className="text-[10px] uppercase tracking-[0.24em]"
              style={{
                color: isFocus ? "var(--accent-gold)" : "var(--text-secondary)",
              }}
            >
              Semaine complète
            </p>
            <p
              className="text-[11px]"
              style={{ color: "var(--text-secondary)" }}
            >
              7 jours
            </p>
          </div>
          <div className="mt-5">
            <WeekPips
              weekDays={weekDays}
              entries={entries}
              virtueId={virtue.id}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
