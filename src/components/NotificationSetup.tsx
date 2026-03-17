"use client";

import { useEffect, useState } from "react";

import type { PushSubscriptionInput } from "@/types";

type NotificationSetupProps = {
  vapidPublicKey: string | null;
};

function getApplicationServerKey(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const normalizedValue = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const decodedValue = window.atob(normalizedValue);
  const bytes = Uint8Array.from(decodedValue, (character) =>
    character.charCodeAt(0),
  );
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

function getSubscriptionPayload(
  subscription: PushSubscription,
): PushSubscriptionInput {
  const subscriptionJson = subscription.toJSON();
  const endpoint = subscriptionJson.endpoint;
  const p256dh = subscriptionJson.keys?.p256dh;
  const auth = subscriptionJson.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error("Push subscription payload is incomplete.");
  }

  return {
    endpoint,
    keys: { p256dh, auth },
  };
}

export default function NotificationSetup({
  vapidPublicKey,
}: NotificationSetupProps) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!vapidPublicKey) {
      setSubscribed(false);
      return;
    }

    let isActive = true;

    async function loadStatus() {
      try {
        const response = await fetch("/api/push/status", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load push status.");
        }

        const payload: unknown = await response.json();

        if (
          typeof payload === "object" &&
          payload !== null &&
          "data" in payload &&
          typeof payload.data === "object" &&
          payload.data !== null &&
          "subscribed" in payload.data &&
          typeof payload.data.subscribed === "boolean"
        ) {
          if (isActive) {
            setSubscribed(payload.data.subscribed);
          }

          return;
        }

        throw new Error("Invalid push status payload.");
      } catch {
        if (isActive) {
          setSubscribed(false);
        }
      }
    }

    void loadStatus();

    return () => {
      isActive = false;
    };
  }, [vapidPublicKey]);

  async function handleEnableNotifications() {
    if (
      !vapidPublicKey ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setSubscribed(false);
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setSubscribed(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: getApplicationServerKey(vapidPublicKey),
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: getSubscriptionPayload(subscription),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save the push subscription.");
      }

      setSubscribed(true);
    } catch (error: unknown) {
      console.error("Notification setup failed", error);
      setSubscribed(false);
    }
  }

  if (!vapidPublicKey || subscribed === null || subscribed) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleEnableNotifications}
      className="tracker-focus-ring mt-6 text-[9px] font-light uppercase tracking-[0.22em] hover:opacity-80"
      style={{
        color: "var(--cream-dim)",
        fontFamily: "var(--font-body)",
        transition: "color var(--transition-base), opacity var(--transition-base)",
      }}
    >
      Activer les rappels
    </button>
  );
}
