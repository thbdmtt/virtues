import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  getAppPassword,
  getSessionOptions,
  type AuthSessionData,
} from "@/lib/auth/session";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSubmittedPassword(value: unknown): string | null {
  if (!isRecord(value) || typeof value.password !== "string") {
    return null;
  }

  const password = value.password.trim();

  return password ? password : null;
}

export async function POST(request: NextRequest) {
  try {
    const sessionOptions = getSessionOptions();
    const appPassword = getAppPassword();

    if (!sessionOptions || !appPassword) {
      return NextResponse.json(
        { error: "configuration_missing" },
        { status: 500 },
      );
    }

    const body: unknown = await request.json();
    const password = getSubmittedPassword(body);

    if (!password) {
      return NextResponse.json(
        { error: "invalid_body" },
        { status: 400 },
      );
    }

    const isValidPassword = password === appPassword;

    if (!isValidPassword) {
      return NextResponse.json({ error: "incorrect" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<AuthSessionData>(
      cookieStore,
      sessionOptions,
    );

    session.authenticated = true;
    session.createdAt = Date.now();

    await session.save();

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error: unknown) {
    console.error("POST /api/auth failed", error);

    return NextResponse.json(
      { error: "Failed to authenticate." },
      { status: 500 },
    );
  }
}
