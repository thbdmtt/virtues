import { unsealData } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

import {
  getAuthCookieName,
  getSessionOptions,
  getSessionTtlSeconds,
  isAuthSessionData,
} from "@/lib/auth/session";

function getLoginRedirect(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function middleware(request: NextRequest) {
  const sessionOptions = getSessionOptions();
  const sessionCookie = request.cookies.get(getAuthCookieName())?.value;

  if (!sessionOptions || !sessionCookie) {
    return getLoginRedirect(request);
  }

  try {
    const sessionData = await unsealData<unknown>(sessionCookie, {
      password: sessionOptions.password,
      ttl: getSessionTtlSeconds(),
    });

    if (!isAuthSessionData(sessionData)) {
      return getLoginRedirect(request);
    }

    return NextResponse.next();
  } catch {
    return getLoginRedirect(request);
  }
}

export const config = {
  matcher: [
    "/((?!login|api/auth|api/health|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
