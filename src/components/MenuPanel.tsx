"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { Virtue } from "@/types";

type Props = {
  virtues: Virtue[];
  focusId: number;
  isOpen: boolean;
  onClose: () => void;
};

const NAVIGATION_DELAY_MS = 300;

function getOrderedVirtues(virtues: Virtue[], focusId: number): Virtue[] {
  const focusVirtue = virtues.find((virtue) => virtue.id === focusId);
  const otherVirtues = virtues.filter((virtue) => virtue.id !== focusId);

  return focusVirtue ? [focusVirtue, ...otherVirtues] : virtues;
}

function formatVirtueNumber(id: number): string {
  return String(id).padStart(2, "0");
}

export default function MenuPanel({
  virtues,
  focusId,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const ordered = getOrderedVirtues(virtues, focusId);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function scheduleNavigation(path: string) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    onClose();
    timeoutRef.current = window.setTimeout(() => {
      router.push(path);
    }, NAVIGATION_DELAY_MS);
  }

  function handleVirtueClick(id: number) {
    scheduleNavigation(`/virtue/${id}`);
  }

  function handleCycleClick() {
    scheduleNavigation("/cycle");
  }

  return (
    <div
      aria-hidden={!isOpen}
      aria-label="Menu des vertus"
      aria-modal={isOpen}
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--void)",
        zIndex: 500,
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform var(--transition-base)",
        display: "flex",
        flexDirection: "column",
        paddingTop: "max(var(--safe-top), 52px)",
        paddingLeft: "calc(28px + var(--safe-left))",
        paddingRight: "calc(28px + var(--safe-right))",
        paddingBottom: "max(var(--safe-bottom), 40px)",
        overflowY: "auto",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={onClose}
        className="tracker-focus-ring"
        style={{
          position: "absolute",
          top: "max(var(--safe-top), 52px)",
          right: "calc(28px + var(--safe-right))",
          background: "none",
          border: "none",
          color: "var(--cream-mid)",
          fontSize: "18px",
          opacity: 0.5,
          cursor: "pointer",
          padding: "8px",
          lineHeight: 1,
          fontFamily: "var(--font-body)",
        }}
      >
        ×
      </button>

      <div
        className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "48px",
          flex: 1,
        }}
      >
        {ordered.map((virtue, index) => {
          const isFocus = virtue.id === focusId;

          return (
            <button
              key={virtue.id}
              type="button"
              onClick={() => handleVirtueClick(virtue.id)}
              className="tracker-focus-ring"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "20px",
                paddingTop: "16px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--cream-line-strong)",
                borderTop:
                  index === 0
                    ? "1px solid var(--cream-line-strong)"
                    : "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  fontWeight: 300,
                  letterSpacing: "0.2em",
                  color: isFocus ? "var(--gold-soft)" : "var(--cream-dim)",
                  opacity: isFocus ? 1 : 0.7,
                  minWidth: "22px",
                  flexShrink: 0,
                }}
              >
                {formatVirtueNumber(virtue.id)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(24px, 6vw, 30px)",
                  fontWeight: 300,
                  color: isFocus ? "var(--gold)" : "var(--cream)",
                  letterSpacing: "-0.015em",
                  lineHeight: 1,
                }}
              >
                {virtue.nameFr}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleCycleClick}
          className="tracker-focus-ring"
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid var(--cream-line-strong)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              fontWeight: 300,
              letterSpacing: "0.3em",
              color: "var(--cream-dim)",
              opacity: 0.5,
              textTransform: "uppercase",
            }}
          >
            Cycle
          </span>
        </button>
      </div>
    </div>
  );
}
