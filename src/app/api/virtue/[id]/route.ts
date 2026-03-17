import { NextResponse } from "next/server";

import { getVirtueById } from "@/lib/db/queries";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseVirtueId(value: string): number | null {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 13) {
    return null;
  }

  return parsedValue;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const virtueId = parseVirtueId(id);

    if (!virtueId) {
      return NextResponse.json(
        { error: "Invalid virtue id." },
        { status: 400 },
      );
    }

    const virtue = await getVirtueById(virtueId);

    if (!virtue) {
      return NextResponse.json(
        { error: "Virtue not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: virtue }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/virtue/[id] failed", error);

    return NextResponse.json(
      { error: "Failed to load virtue." },
      { status: 500 },
    );
  }
}
