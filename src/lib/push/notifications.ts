import webpush from "web-push";

import type { PushSubscriptionRecord } from "@/types";

type PushConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

type DailyNotificationPayload = {
  title: string;
  body: string;
  tag: string;
};

const DAILY_NOTIFICATION = {
  title: "Virtues",
  body: "Ta journée t'attend. Prends un moment.",
  tag: "virtues-daily",
} as const satisfies DailyNotificationPayload;

function getEnvValue(
  key: "CRON_SECRET" | "VAPID_EMAIL" | "VAPID_PRIVATE_KEY" | "VAPID_PUBLIC_KEY",
): string | null {
  const value = process.env[key]?.trim();

  return value ? value : null;
}

function getPushSubject(email: string): string {
  return email.startsWith("mailto:") ? email : `mailto:${email}`;
}

function getPushConfig(): PushConfig | null {
  const publicKey = getEnvValue("VAPID_PUBLIC_KEY");
  const privateKey = getEnvValue("VAPID_PRIVATE_KEY");
  const email = getEnvValue("VAPID_EMAIL");

  if (!publicKey || !privateKey || !email) {
    return null;
  }

  return {
    publicKey,
    privateKey,
    subject: getPushSubject(email),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStatusCode(error: unknown): number | null {
  if (!isRecord(error) || typeof error.statusCode !== "number") {
    return null;
  }

  return error.statusCode;
}

function getWebPushSubscription(subscription: PushSubscriptionRecord) {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keysP256dh,
      auth: subscription.keysAuth,
    },
  };
}

export function getCronSecret(): string | null {
  return getEnvValue("CRON_SECRET");
}

export function getPublicVapidKey(): string | null {
  return getEnvValue("VAPID_PUBLIC_KEY");
}

export function getDailyNotificationPayload(): DailyNotificationPayload {
  return DAILY_NOTIFICATION;
}

export function isPushConfigured(): boolean {
  return getPushConfig() !== null;
}

export async function sendDailyNotifications(
  subscriptions: PushSubscriptionRecord[],
): Promise<{ sentCount: number; removedEndpoints: string[] }> {
  const pushConfig = getPushConfig();

  if (!pushConfig) {
    throw new Error("VAPID configuration missing.");
  }

  webpush.setVapidDetails(
    pushConfig.subject,
    pushConfig.publicKey,
    pushConfig.privateKey,
  );

  let sentCount = 0;
  const removedEndpoints: string[] = [];
  const payload = JSON.stringify(getDailyNotificationPayload());

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        getWebPushSubscription(subscription),
        payload,
      );
      sentCount += 1;
    } catch (error: unknown) {
      const statusCode = getStatusCode(error);

      if (statusCode === 404 || statusCode === 410) {
        removedEndpoints.push(subscription.endpoint);
        continue;
      }

      console.error("Failed to send push notification", error);
    }
  }

  return { sentCount, removedEndpoints };
}
