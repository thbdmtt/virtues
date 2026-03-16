export function getWeekMarkKey(virtueId: number, dayIdx: number): string {
  return `${virtueId}-${dayIdx}`;
}

export function countMarkedEntries(marks: Record<string, boolean>): number {
  return Object.values(marks).reduce((total, isMarked) => {
    return isMarked ? total + 1 : total;
  }, 0);
}
