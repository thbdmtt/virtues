export type CellState = "empty" | "clean" | "marked";

export type Virtue = {
  id: number;
  nameFr: string;
  nameEn: string;
  description: string;
  maxim: string;
  weekNumber: number;
};

export type Entry = {
  date: string;
  virtueId: number;
  hasMark: boolean;
};

export type DayData = {
  date: string;
  cells: Record<number, CellState>;
};

export type WeekData = {
  weekStart: string;
  weekLabel: string;
  weekDays: DayData[];
  completedDays: string[];
  virtues: Virtue[];
  entries: Record<string, CellState>;
  virtueFocus: Virtue;
  weekScore: number;
};

export type WeekScore = {
  weekStart: string;
  score: number;
};

export type HistoryItem = WeekScore;

export type Trend = "improving" | "stable" | "declining";

export type HardestVirtue = {
  id: number;
  nameFr: string;
  totalMarks: number;
};

export type CycleSegmentState = "completed" | "current" | "future";

export type CycleSegment = {
  weekNumber: number;
  score: number | null;
  state: CycleSegmentState;
};

export type CycleStatsData = {
  hardestVirtue: HardestVirtue;
  weeklyScores: WeekScore[];
  currentCycleWeek: number;
  trend: Trend;
};

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionInput = {
  endpoint: string;
  keys: PushSubscriptionKeys;
};

export type PushSubscriptionRecord = {
  id: number;
  endpoint: string;
  keysP256dh: string;
  keysAuth: string;
  createdAt: string;
};
