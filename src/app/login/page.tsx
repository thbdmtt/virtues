"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AuthSuccess = {
  data: {
    success: boolean;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthSuccess(value: unknown): value is AuthSuccess {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    value.data.success === true
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const payload: unknown = await response.json();

      if (response.ok && isAuthSuccess(payload)) {
        router.push("/");
        router.refresh();
        return;
      }

      if (isRecord(payload) && payload.error === "incorrect") {
        setErrorMessage("Mot de passe incorrect");
        return;
      }

      setErrorMessage("Authentification indisponible");
    } catch {
      setErrorMessage("Authentification indisponible");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        padding:
          "max(var(--safe-top), 32px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 32px) calc(28px + var(--safe-left))",
        backgroundColor: "var(--void)",
      }}
    >
      <div className="flex min-h-[calc(100vh-var(--safe-top)-var(--safe-bottom))] items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[280px] flex-col items-center"
        >
          <h1
            className="text-[32px] font-light tracking-[-0.02em]"
            style={{
              color: "var(--cream)",
              fontFamily: "var(--font-display)",
            }}
          >
            Franklin
          </h1>

          <span
            aria-hidden="true"
            className="mt-4 h-px w-10"
            style={{ backgroundColor: "var(--gold-line)" }}
          />

          <label className="sr-only" htmlFor="password">
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="···"
            autoComplete="current-password"
            className="tracker-focus-ring mt-12 min-h-12 w-full rounded-[18px] border px-4 py-[14px] text-[14px] outline-none"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--gold-line)",
              color: "var(--cream)",
              fontFamily: "var(--font-body)",
              transition:
                "border-color var(--transition-base), background-color var(--transition-base), box-shadow var(--transition-base)",
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="tracker-focus-ring mt-6 inline-flex h-12 w-12 items-center justify-center rounded-full border"
            style={{
              borderColor: "var(--gold-line)",
              backgroundColor: "transparent",
              color: "var(--gold)",
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              transition:
                "border-color var(--transition-base), background-color var(--transition-base), color var(--transition-base), opacity var(--transition-base)",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            →
          </button>

          <p
            className="mt-4 min-h-[14px] text-center text-[10px]"
            style={{
              color: "var(--fault)",
              opacity: errorMessage ? 0.8 : 0,
              fontFamily: "var(--font-body)",
              transition: "opacity var(--transition-base)",
            }}
          >
            {errorMessage || "Mot de passe incorrect"}
          </p>
        </form>
      </div>
    </main>
  );
}
