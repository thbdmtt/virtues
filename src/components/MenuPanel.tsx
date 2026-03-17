"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Virtue } from "@/types";

type MenuPanelProps = {
  virtues: Virtue[];
  focusId: number;
  isOpen: boolean;
  onClose: () => void;
};

type CloseButtonProps = {
  onClose: () => void;
};

function getOrderedVirtues(virtues: Virtue[]): Virtue[] {
  return [...virtues].sort((firstVirtue, secondVirtue) => {
    return firstVirtue.id - secondVirtue.id;
  });
}

function formatVirtueNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function CloseButton({ onClose }: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label="Fermer le menu"
      onClick={onClose}
      className="tracker-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full"
      style={{
        backgroundColor: "color-mix(in srgb, var(--surface) 84%, transparent)",
        transition:
          "background-color var(--transition-base), transform var(--transition-base)",
      }}
    >
      <span className="relative block h-[18px] w-[18px]">
        <span
          className="absolute left-0 top-1/2 block h-px w-[18px] -translate-y-1/2 rotate-45"
          style={{ backgroundColor: "var(--cream-dim)" }}
        />
        <span
          className="absolute left-0 top-1/2 block h-px w-[18px] -translate-y-1/2 -rotate-45"
          style={{ backgroundColor: "var(--cream-dim)" }}
        />
      </span>
    </button>
  );
}

export default function MenuPanel({
  virtues,
  focusId,
  isOpen,
  onClose,
}: MenuPanelProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const router = useRouter();
  const [expandedVirtueId, setExpandedVirtueId] = useState<number | null>(null);
  const orderedVirtues = getOrderedVirtues(virtues);

  useEffect(() => {
    if (!isOpen) {
      setExpandedVirtueId(null);
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

  function handleToggleVirtue(virtueId: number) {
    setExpandedVirtueId((currentVirtueId) => {
      return currentVirtueId === virtueId ? null : virtueId;
    });
  }

  function handleOpenCycle() {
    onClose();
    router.push("/cycle");
  }

  return (
    <motion.aside
      aria-hidden={!isOpen}
      aria-label="Menu des vertus"
      aria-modal={isOpen}
      role="dialog"
      initial={false}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-0 z-[500] flex"
      onClick={onClose}
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        padding:
          "max(var(--safe-top), 52px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 40px) calc(28px + var(--safe-left))",
        backgroundColor: "color-mix(in srgb, var(--void) 92%, transparent)",
      }}
    >
      <motion.div
        initial={false}
        animate={
          shouldReduceMotion
            ? { opacity: isOpen ? 1 : 0 }
            : { x: isOpen ? "0%" : "100%" }
        }
        transition={{
          duration: shouldReduceMotion ? 0.15 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative ml-auto flex h-full w-full max-w-[30rem] flex-col overflow-hidden rounded-[32px] border"
        onClick={(event) => event.stopPropagation()}
        style={{
          borderColor: "color-mix(in srgb, var(--cream) 5%, transparent)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, var(--deep)), color-mix(in srgb, var(--deep) 92%, var(--void)))",
          boxShadow: "var(--shadow-panel), var(--shadow-inset)",
        }}
      >
        <div className="flex items-start justify-between px-7 pt-7">
          <div>
            <p
              className="mt-12 text-[11px] font-light italic tracking-[0.1em]"
              style={{
                color: "var(--cream-dim)",
                fontFamily: "var(--font-display)",
              }}
            >
              Les treize vertus de Benjamin Franklin
            </p>
          </div>
          <CloseButton onClose={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 pt-8">
          {orderedVirtues.map((virtue) => {
            const isExpanded = expandedVirtueId === virtue.id;
            const isFocus = virtue.id === focusId;

            return (
              <button
                key={virtue.id}
                type="button"
                aria-expanded={isExpanded}
                onClick={() => handleToggleVirtue(virtue.id)}
                className="tracker-focus-ring block w-full border-b py-4 text-left"
                style={{
                  borderBottomColor:
                    "color-mix(in srgb, var(--cream) 5%, transparent)",
                  paddingLeft: isExpanded ? "6px" : "0px",
                  transition: shouldReduceMotion
                    ? "opacity var(--transition-base)"
                    : "padding-left var(--t-fast) var(--ease)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[9px] font-light uppercase tracking-[0.25em]"
                      style={{ color: "var(--cream-dim)", opacity: 0.5 }}
                    >
                      {formatVirtueNumber(virtue.id)}
                    </span>
                    {isFocus ? (
                      <span
                        className="text-[8px] font-light uppercase tracking-[0.2em]"
                        style={{ color: "var(--gold)" }}
                      >
                        Focus
                      </span>
                    ) : null}
                  </div>
                  <span
                    className="text-[10px] font-light uppercase tracking-[0.18em]"
                    style={{ color: "var(--cream-dim)", opacity: 0.55 }}
                  >
                    {virtue.nameEn}
                  </span>
                </div>

                <p
                  className="mt-2 text-[clamp(22px,6vw,28px)] font-light tracking-[-0.01em]"
                  style={{
                    color: "var(--cream)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {virtue.nameFr}
                </p>

                <p
                  className="mt-2 text-[12px] font-light italic"
                  style={{
                    color: "var(--cream-mid)",
                    opacity: 0.6,
                    fontFamily: "var(--font-display)",
                    lineHeight: 1.7,
                  }}
                >
                  {virtue.description}
                </p>

                <div
                  aria-hidden={!isExpanded}
                  className="overflow-hidden pr-8"
                  style={{
                    maxHeight: isExpanded ? "80px" : "0px",
                    opacity: isExpanded ? 0.75 : 0,
                    transition: shouldReduceMotion
                      ? "opacity var(--transition-base)"
                      : "max-height var(--t-mid) var(--ease), opacity var(--t-mid) var(--ease)",
                  }}
                >
                  <p
                    className="pt-3 text-[12px] font-light italic"
                    style={{
                      color: "var(--cream-dim)",
                      fontFamily: "var(--font-display)",
                      opacity: 0.75,
                      lineHeight: 1.7,
                    }}
                  >
                    « {virtue.maxim} »
                  </p>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleOpenCycle}
            className="tracker-focus-ring mt-6 w-full border-t pt-5 text-left"
            style={{
              borderTopColor: "color-mix(in srgb, var(--cream) 8%, transparent)",
            }}
          >
            <span
              className="text-[11px] font-light uppercase tracking-[0.2em]"
              style={{ color: "var(--cream-dim)", fontFamily: "var(--font-body)" }}
            >
              Cycle
            </span>
          </button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
