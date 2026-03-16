import type { CellState } from "@/types";

export type VirtueCellMode = "compact" | "today";

export function getActionLabel(state: CellState): string {
  return state === "marked" ? "Annuler" : "Marquer";
}

export function getCompactBackgroundColor(state: CellState): string {
  if (state === "clean") {
    return "color-mix(in srgb, var(--success) 18%, transparent)";
  }

  if (state === "marked") {
    return "color-mix(in srgb, var(--mark-red) 12%, transparent)";
  }

  return "transparent";
}

export function getCompactBorderColor(
  state: CellState,
  isFocusVirtue: boolean,
): string {
  if (state === "clean") {
    return "color-mix(in srgb, var(--success) 62%, var(--border-soft))";
  }

  if (state === "marked") {
    return "color-mix(in srgb, var(--mark-red) 48%, var(--border-soft))";
  }

  if (isFocusVirtue) {
    return "color-mix(in srgb, var(--accent-gold) 52%, var(--border-soft))";
  }

  return "var(--border-soft)";
}

export function getCompactShadow(
  state: CellState,
  isFocusVirtue: boolean,
): string {
  if (state === "clean") {
    return "0 0 0 1px color-mix(in srgb, var(--success) 16%, transparent)";
  }

  if (isFocusVirtue) {
    return "0 0 0 1px var(--ring-soft)";
  }

  return "none";
}

export function getCompactDotColor(state: CellState): string {
  if (state === "clean") {
    return "var(--success)";
  }

  return "var(--mark-red)";
}

export function getTodayBackgroundColor(state: CellState): string {
  if (state === "marked") {
    return "var(--mark-red)";
  }

  if (state === "clean") {
    return "color-mix(in srgb, var(--success) 22%, transparent)";
  }

  return "transparent";
}

export function getTodayBorderColor(state: CellState): string {
  if (state === "marked") {
    return "var(--mark-red)";
  }

  if (state === "clean") {
    return "color-mix(in srgb, var(--success) 76%, var(--text-secondary))";
  }

  return "var(--text-secondary)";
}

export function getTodayShadow(state: CellState): string {
  if (state === "clean") {
    return "0 0 0 1px color-mix(in srgb, var(--success) 18%, transparent)";
  }

  return "none";
}

export function getDotOpacity(state: CellState): number {
  return state === "empty" ? 0 : 1;
}

export function getDotScale(state: CellState): number {
  return state === "empty" ? 0 : 1;
}

export function getDotSize(mode: VirtueCellMode, state: CellState): number {
  if (state === "empty") {
    return 0;
  }

  if (mode === "today") {
    return state === "marked" ? 10 : 0;
  }

  return state === "marked" ? 8 : 6;
}

export function getDotShadow(mode: VirtueCellMode, state: CellState): string {
  void mode;
  void state;
  return "0 0 0 transparent";
}
