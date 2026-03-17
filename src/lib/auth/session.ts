import type { SessionOptions } from "iron-session";

export type AuthSessionData = {
  authenticated: true;
  createdAt: number;
};

const AUTH_COOKIE_NAME = "franklin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function getEnvValue(key: "APP_PASSWORD" | "SESSION_SECRET"): string | null {
  const value = process.env[key]?.trim();

  return value ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getAppPassword(): string | null {
  return getEnvValue("APP_PASSWORD");
}

export function getSessionOptions(): SessionOptions | null {
  const password = getEnvValue("SESSION_SECRET");

  if (!password || password.length < 32) {
    return null;
  }

  return {
    password,
    cookieName: AUTH_COOKIE_NAME,
    ttl: SESSION_TTL_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      path: "/",
    },
  } satisfies SessionOptions;
}

export function getSessionTtlSeconds(): number {
  return SESSION_TTL_SECONDS;
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

export function isAuthSessionData(value: unknown): value is AuthSessionData {
  if (!isRecord(value)) {
    return false;
  }

  return value.authenticated === true && typeof value.createdAt === "number";
}
