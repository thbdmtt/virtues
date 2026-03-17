"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

function formatVirtueNumber(value: number): string {
  return String(value).padStart(2, "0");
}

function getOrderedVirtues(virtues: Virtue[], focusId: number): Virtue[] {
  const focusVirtue = virtues.find((virtue) => virtue.id === focusId);
  const remainingVirtues = [...virtues]
    .filter((virtue) => virtue.id !== focusId)
    .sort((firstVirtue, secondVirtue) => firstVirtue.id - secondVirtue.id);

  return focusVirtue ? [focusVirtue, ...remainingVirtues] : remainingVirtues;
}

function CloseButton({ onClose }: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label="Fermer le menu"
      onClick={onClose}
      className="tracker-focus-ring absolute z-[2] inline-flex items-center justify-center hover:opacity-90"
      style={{
        top: "max(var(--safe-top), 52px)",
        right: "calc(28px + var(--safe-right))",
        minWidth: "44px",
        minHeight: "44px",
        padding: "8px",
        color: "var(--cream-dim)",
        fontFamily: "var(--font-body)",
        fontSize: "18px",
        opacity: 0.5,
        transition: "opacity var(--transition-base)",
      }}
    >
      ×
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
  const orderedVirtues = getOrderedVirtues(virtues, focusId);

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

  function handleOpenVirtue(virtueId: number) {
    onClose();
    router.push(`/virtue/${virtueId}`);
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
      <CloseButton onClose={onClose} />
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
        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingTop: "8px",
            paddingBottom: "max(var(--safe-bottom), 32px)",
          }}
        >
          <div className="flex flex-col">
            {orderedVirtues.map((virtue, index) => {
              const isFocus = virtue.id === focusId;

              return (
                <button
                  key={virtue.id}
                  type="button"
                  onClick={() => handleOpenVirtue(virtue.id)}
                  className="tracker-focus-ring block w-full border-b py-4 text-left"
                  style={{
                    borderBottomColor: "var(--cream-line-strong)",
                    borderTopColor:
                      index === 0 ? "var(--cream-line-strong)" : undefined,
                    borderTopWidth: index === 0 ? "1px" : undefined,
                    transition: "opacity var(--transition-base)",
                  }}
                >
                  <div className="flex items-baseline gap-6">
                    <span
                      className="inline-block min-w-[20px] text-[10px] font-light uppercase tracking-[0.2em]"
                      style={{
                        color: isFocus ? "var(--gold-soft)" : "var(--cream-dim)",
                        fontFamily: "var(--font-body)",
                        opacity: isFocus ? 1 : 0.4,
                      }}
                    >
                      {formatVirtueNumber(virtue.id)}
                    </span>
                    <span
                      className="text-[clamp(22px,5.5vw,26px)] font-light leading-none tracking-[-0.01em]"
                      style={{
                        color: isFocus ? "var(--gold)" : "var(--cream)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {virtue.nameFr}
                    </span>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleOpenCycle}
              className="tracker-focus-ring mt-4 w-full border-t pt-4 text-left"
              style={{
                borderTopColor: "var(--cream-line-strong)",
              }}
            >
              <span
                className="text-[10px] font-light uppercase tracking-[0.3em]"
                style={{
                  color: "var(--cream-dim)",
                  fontFamily: "var(--font-body)",
                  opacity: 0.5,
                }}
              >
                Cycle
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}
