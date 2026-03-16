import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getWeekEntries, toggleMark } from "@/lib/db/queries";
import { formatDateKey } from "@/lib/utils/dates";
import type { CellState } from "@/types";

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_VIRTUE_ID = 1;
const MAX_VIRTUE_ID = 13;

type MarkRequestBody = {
  date: string;
  virtueId: number;
};

function isDateInputValid(value: string): boolean {
  if (!DATE_PARAM_PATTERN.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  return !Number.isNaN(parsedDate.getTime()) && formatDateKey(parsedDate) === value;
}

function isVirtueIdValid(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_VIRTUE_ID &&
    value <= MAX_VIRTUE_ID
  );
}

function isMarkRequestBody(value: unknown): value is MarkRequestBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const date = Reflect.get(value, "date");
  const virtueId = Reflect.get(value, "virtueId");

  return typeof date === "string" && typeof virtueId === "number";
}

function getCellState(
  date: string,
  virtueId: number,
  entries: Awaited<ReturnType<typeof getWeekEntries>>,
): CellState {
  const updatedEntry = entries.find(
    (entry) => entry.date === date && entry.virtueId === virtueId,
  );

  if (!updatedEntry) {
    return "empty";
  }

  return updatedEntry.hasMark ? "marked" : "clean";
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch (error: unknown) {
      console.error("POST /api/mark invalid JSON", error);

      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    if (!isMarkRequestBody(body)) {
      return NextResponse.json(
        { error: "Body must include date and virtueId." },
        { status: 400 },
      );
    }

    if (!isDateInputValid(body.date)) {
      return NextResponse.json(
        { error: "Invalid date. Expected format YYYY-MM-DD." },
        { status: 400 },
      );
    }

    if (!isVirtueIdValid(body.virtueId)) {
      return NextResponse.json(
        { error: "Invalid virtueId. Expected an integer between 1 and 13." },
        { status: 400 },
      );
    }

    await toggleMark(body.date, body.virtueId);

    const weekEntries = await getWeekEntries(new Date(`${body.date}T00:00:00`));
    const newState = getCellState(body.date, body.virtueId, weekEntries);

    revalidatePath("/");

    return NextResponse.json(
      {
        data: {
          date: body.date,
          virtueId: body.virtueId,
          newState,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("POST /api/mark failed", error);

    return NextResponse.json(
      { error: "Failed to update mark." },
      { status: 500 },
    );
  }
}
