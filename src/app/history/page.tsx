import Link from "next/link";
import { parseISO } from "date-fns";

import { PWA_APP_NAME } from "@/lib/theme/pwa";
import {
  getBaseUrl,
  getRequestCookieHeader,
} from "@/lib/http/getBaseUrl";
import { formatDateKey, getCurrentWeekStart, getWeekLabel } from "@/lib/utils/dates";
import type { HistoryItem } from "@/types";

type HistoryApiSuccess = {
  data: HistoryItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.weekStart === "string" && typeof value.score === "number";
}

function isHistoryApiSuccess(value: unknown): value is HistoryApiSuccess {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return false;
  }

  return value.data.every(isHistoryItem);
}

async function getHistoryData(): Promise<HistoryItem[]> {
  const baseUrl = await getBaseUrl();
  const cookieHeader = await getRequestCookieHeader();
  const response = await fetch(`${baseUrl}/api/history`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch history data.");
  }

  if (!isHistoryApiSuccess(payload)) {
    throw new Error("History API returned an invalid payload.");
  }

  return payload.data;
}

function getBarWidth(score: number, maxScore: number): string {
  if (maxScore <= 0) {
    return "0%";
  }

  return `${(score / maxScore) * 100}%`;
}

function getBarColor(score: number, maxScore: number): string {
  if (maxScore <= 0) {
    return "var(--success)";
  }

  const successWeight = 100 - Math.round((score / maxScore) * 100);

  return `color-mix(in srgb, var(--success) ${successWeight}%, var(--mark-red))`;
}

export default async function HistoryPage() {
  const history = await getHistoryData();
  const maxScore = history.reduce(
    (highestScore, item) => Math.max(highestScore, item.score),
    0,
  );
  const currentWeekStartKey = formatDateKey(getCurrentWeekStart());

  return (
    <main
      className="min-h-screen px-6 pb-[calc(2rem+var(--safe-bottom))] pt-0 lg:px-10 lg:pb-[calc(2.5rem+var(--safe-bottom))]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 pt-[calc(2rem+var(--safe-top))] lg:pt-[calc(2.5rem+var(--safe-top))] md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              {PWA_APP_NAME}
            </p>
            <div className="space-y-1">
              <h1 className="text-4xl text-[var(--text-primary)]">
                Historique hebdomadaire
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Treize semaines de suivi, de la plus ancienne à la semaine courante.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-primary)",
              transition: "all var(--transition-base)",
            }}
          >
            Retour au tableau
          </Link>
        </header>

        <section
          className="rounded-2xl border p-6"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl text-[var(--text-primary)]">
                13 dernières semaines
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Plus le score est bas, plus la semaine est propre.
              </p>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Score maximal observé : {maxScore}
            </p>
          </div>

          <ol className="mt-6 space-y-4">
            {history.map((item) => {
              const weekLabel = getWeekLabel(parseISO(item.weekStart));
              const isCurrentWeek = item.weekStart === currentWeekStartKey;

              return (
                <li
                  key={item.weekStart}
                  className="grid gap-3 rounded-xl border p-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_96px] md:items-center"
                  style={{
                    borderColor: isCurrentWeek
                      ? "var(--accent-gold)"
                      : "var(--border)",
                    backgroundColor: isCurrentWeek
                      ? "color-mix(in srgb, var(--accent-gold) 6%, var(--bg-elevated))"
                      : "var(--bg-elevated)",
                    transition: "all var(--transition-base)",
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base text-[var(--text-primary)]">
                        {weekLabel}
                      </p>
                      {isCurrentWeek ? (
                        <span
                          className="rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em]"
                          style={{
                            borderColor: "var(--accent-gold-dim)",
                            color: "var(--accent-gold)",
                          }}
                        >
                          En cours
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {item.weekStart}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 flex-1 overflow-hidden rounded-full border"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--bg-base)",
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: getBarWidth(item.score, maxScore),
                          backgroundColor: getBarColor(item.score, maxScore),
                          transition:
                            "width var(--transition-base), background-color var(--transition-base)",
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] md:text-right">
                    {item.score} manquements
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
