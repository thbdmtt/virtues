import { headers } from "next/headers";

export async function getBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Missing host header for local API request.");
  }

  return `${protocol}://${host}`;
}

export async function getRequestCookieHeader(): Promise<string | null> {
  const requestHeaders = await headers();

  return requestHeaders.get("cookie");
}
