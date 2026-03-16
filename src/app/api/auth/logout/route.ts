import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getSessionOptions,
  type AuthSessionData,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const sessionOptions = getSessionOptions();

    if (!sessionOptions) {
      return NextResponse.json(
        { error: "configuration_missing" },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const session = await getIronSession<AuthSessionData>(
      cookieStore,
      sessionOptions,
    );

    session.destroy();

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error: unknown) {
    console.error("POST /api/auth/logout failed", error);

    return NextResponse.json(
      { error: "Failed to logout." },
      { status: 500 },
    );
  }
}
