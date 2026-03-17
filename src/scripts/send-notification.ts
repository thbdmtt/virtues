import { loadEnvConfig } from "@next/env";

const DEFAULT_BASE_URL = "http://localhost:3000";

loadEnvConfig(process.cwd());

function getEnvValue(key: "APP_PASSWORD" | "NOTIFY_BASE_URL"): string | null {
  const value = process.env[key]?.trim();

  return value ? value : null;
}

async function sendNotification(): Promise<void> {
  const appPassword = getEnvValue("APP_PASSWORD");

  if (!appPassword) {
    throw new Error("APP_PASSWORD manquant pour envoyer les notifications.");
  }

  const baseUrl = getEnvValue("NOTIFY_BASE_URL") ?? DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}/api/push/send`, {
    method: "POST",
    headers: {
      "x-app-password": appPassword,
    },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(`Push send failed: ${JSON.stringify(payload)}`);
  }

  console.log(JSON.stringify(payload));
}

sendNotification().catch((error: unknown) => {
  console.error("Failed to trigger push notifications.", error);
  process.exitCode = 1;
});
