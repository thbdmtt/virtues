"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type WeekNavProps = {
  previousHref: string;
  nextHref: string;
  weekLabel: string;
  weekScore: number;
  cycleLabel: string;
  currentDayLabel: string;
  isCurrentDayComplete: boolean;
  isNextDisabled: boolean;
  currentPageIndex: number;
  pageCount: number;
  currentVirtueId: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

type NavArrowProps = {
  href: string;
  label: string;
  direction: "previous" | "next";
  disabled?: boolean;
};

type PagerArrowProps = {
  label: string;
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];

function getRomanVirtueNumber(id: number): string {
  return ROMAN_NUMERALS[id - 1] ?? id.toString();
}

function NavArrow({ href, label, direction, disabled = false }: NavArrowProps) {
  const icon =
    direction === "previous" ? (
      <ChevronLeft className="h-4 w-4" />
    ) : (
      <ChevronRight className="h-4 w-4" />
    );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "var(--bg-panel)",
          color: "var(--text-secondary)",
          opacity: 0.45,
        }}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="tracker-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border hover:-translate-y-px"
      style={{
        borderColor: "var(--border-soft)",
        color: "var(--text-primary)",
        backgroundColor: "var(--bg-panel)",
        boxShadow: "var(--shadow-soft)",
        transition:
          "transform var(--transition-base), border-color var(--transition-base), background-color var(--transition-base), color var(--transition-base)",
      }}
    >
      {icon}
    </Link>
  );
}

function PagerArrow({ label, direction, disabled, onClick }: PagerArrowProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px]"
        style={{
          borderColor: "var(--border-soft)",
          color: "var(--text-secondary)",
          opacity: 0.45,
        }}
      >
        <span aria-hidden="true">{direction === "previous" ? "←" : "→"}</span>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="tracker-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] hover:-translate-y-px"
      style={{
        borderColor: "var(--border-soft)",
        color: "var(--text-primary)",
        backgroundColor:
          "color-mix(in srgb, var(--bg-panel-strong) 78%, var(--bg-panel))",
        transition:
          "transform var(--transition-base), border-color var(--transition-base), background-color var(--transition-base), color var(--transition-base)",
      }}
    >
      <span aria-hidden="true">{direction === "previous" ? "←" : "→"}</span>
    </button>
  );
}

export default function WeekNav({
  previousHref,
  nextHref,
  weekLabel,
  weekScore,
  cycleLabel,
  currentDayLabel,
  isCurrentDayComplete,
  isNextDisabled,
  currentPageIndex,
  pageCount,
  currentVirtueId,
  onPreviousPage,
  onNextPage,
}: WeekNavProps) {
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pageCount - 1;
  const currentPageLabel = `${getRomanVirtueNumber(currentVirtueId)} · ${currentPageIndex + 1}/${pageCount}`;

  return (
    <nav
      aria-label="Navigation hebdomadaire"
      className="grid gap-5 rounded-[28px] border px-5 pt-5 pb-[calc(1.25rem+var(--safe-bottom))] sm:px-6 sm:pt-6 sm:pb-[calc(1.5rem+var(--safe-bottom))] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:pb-6"
      style={{
        fontFamily: "var(--font-body)",
        borderColor: "var(--border-soft)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-panel-soft) 84%, var(--bg-surface)), var(--bg-panel))",
        boxShadow: "var(--shadow-soft), var(--shadow-inset)",
      }}
    >
      <div
        className="inline-flex w-fit items-center gap-2 rounded-full border p-1"
        style={{
          borderColor: "var(--border-soft)",
          backgroundColor: "color-mix(in srgb, var(--bg-panel-strong) 82%, var(--bg-panel))",
        }}
      >
        <NavArrow
          href={previousHref}
          label="Semaine précédente"
          direction="previous"
        />
        <NavArrow
          href={nextHref}
          label="Semaine suivante"
          direction="next"
          disabled={isNextDisabled}
        />
      </div>
      <div className="lg:text-center">
        <div className="inline-flex items-center gap-2">
          <p
            className="text-[11px] uppercase tracking-[0.22em]"
            style={{
              color: isCurrentDayComplete
                ? "var(--accent-gold)"
                : "var(--text-secondary)",
              transition: "color 400ms ease-out",
            }}
          >
            {currentDayLabel}
          </p>
          <span
            aria-hidden="true"
            className="text-xs"
            style={{
              color: "var(--accent-gold)",
              opacity: isCurrentDayComplete ? 0.7 : 0,
              transition: "opacity 400ms ease-out",
            }}
          >
            ✓
          </span>
        </div>
        <p
          className="mt-3 text-[11px] uppercase tracking-[0.28em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Semaine affichée
        </p>
        <p
          className="mt-3 text-[clamp(2rem,4vw,3rem)] leading-none"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {weekLabel}
        </p>
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: "color-mix(in srgb, var(--bg-panel-strong) 74%, var(--bg-panel))",
          }}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--accent-gold)" }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {cycleLabel}
          </span>
        </div>
      </div>
      <div className="grid gap-3 lg:justify-self-end">
        <div
          className="w-full rounded-[22px] border px-4 py-3 lg:w-[168px]"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor:
              "color-mix(in srgb, var(--bg-panel-strong) 76%, var(--bg-panel))",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Score hebdomadaire
          </p>
          <p
            className="mt-2 text-[2rem] leading-none"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {weekScore}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            manquements
          </p>
        </div>
        <div
          className="flex items-center justify-between gap-2 rounded-full border px-3 py-2"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor:
              "color-mix(in srgb, var(--bg-panel-strong) 78%, var(--bg-panel))",
          }}
        >
          <PagerArrow
            label="Vertu précédente"
            direction="previous"
            disabled={isFirstPage}
            onClick={onPreviousPage}
          />
          <span
            className="text-[11px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {currentPageLabel}
          </span>
          <PagerArrow
            label="Vertu suivante"
            direction="next"
            disabled={isLastPage}
            onClick={onNextPage}
          />
        </div>
      </div>
    </nav>
  );
}
