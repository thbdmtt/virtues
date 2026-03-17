"use client";

import { useEffect, useRef, useState } from "react";

import type { PushSubscriptionInput } from "@/types";

type NotificationSetupProps = {
  vapidPublicKey: string | null;
};

type SetupState = "hidden" | "idle" | "success";

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
  const [setupState, setSetupState] = useState<SetupState>("idle");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "denied") {
      setSetupState("hidden");
    }

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleEnableNotifications() {
    if (
      !vapidPublicKey ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setSetupState("hidden");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setSetupState("hidden");
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

      setSetupState("success");
      timeoutRef.current = window.setTimeout(() => {
        setSetupState("hidden");
      }, 2000);
    } catch (error: unknown) {
      console.error("Notification setup failed", error);
      setSetupState("hidden");
    }
  }

  if (!vapidPublicKey || setupState === "hidden") {
    return null;
  }

  if (setupState === "success") {
    return (
      <p
        className="mt-6 text-[9px] font-light uppercase tracking-[0.22em]"
        style={{
          color: "var(--gold)",
          fontFamily: "var(--font-body)",
          opacity: 0.6,
          transition: "opacity var(--transition-base)",
        }}
      >
        Rappels activés ✓
      </p>
    );
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
