"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import { getReflectionParagraphs } from "@/lib/utils/reflection";
import type { Virtue } from "@/types";

type VirtueDetailProps = {
  virtue: Virtue;
  isCurrentFocus: boolean;
};

const ENTRY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function getVirtueNumber(id: number): string {
  return String(id).padStart(2, "0");
}

function getVirtueNumberLabel(id: number): string {
  if (id < 10) {
    return getVirtueNumber(id).split("").join(" ");
  }

  return String(id);
}

export default function VirtueDetail({
  virtue,
  isCurrentFocus: _isCurrentFocus,
}: VirtueDetailProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const reflectionParagraphs = getReflectionParagraphs(virtue.reflection);

  function getTransition(delay: number) {
    return shouldReduceMotion
      ? { duration: 0.15 }
      : { duration: 0.5, ease: ENTRY_EASE, delay };
  }

  function getAnimate(y: number) {
    return shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  }

  function getInitial(y: number) {
    return shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y };
  }

  return (
    <main
      className="min-h-screen"
      style={{
        padding:
          "max(var(--safe-top), 52px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 40px) calc(28px + var(--safe-left))",
      }}
    >
      <div
        className="flex w-full max-w-[680px] flex-col"
        style={{
          minHeight:
            "calc(100vh - var(--safe-top) - var(--safe-bottom) - 48px)",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="tracker-focus-ring mb-7 w-fit text-[13px] font-light hover:opacity-90"
          style={{
            color: "var(--cream-dim)",
            fontFamily: "var(--font-body)",
            opacity: 0.45,
            transition: "opacity var(--transition-base)",
          }}
        >
          ←
        </button>

        <motion.p
          initial={getInitial(8)}
          animate={getAnimate(8)}
          transition={getTransition(0)}
          className="mb-2 text-[9px] font-light uppercase tracking-[0.4em]"
          style={{ color: "var(--gold-soft)", fontFamily: "var(--font-body)" }}
        >
          {getVirtueNumberLabel(virtue.id)}
        </motion.p>

        <motion.h1
          initial={getInitial(12)}
          animate={getAnimate(12)}
          transition={getTransition(0.08)}
          className="mb-[14px] text-[clamp(48px,12vw,60px)] font-light leading-[0.9] tracking-[-0.025em]"
          style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
        >
          {virtue.nameFr}
        </motion.h1>

        <motion.div
          initial={shouldReduceMotion ? { width: 40 } : { width: 0 }}
          animate={{ width: 40 }}
          transition={getTransition(0.16)}
          className="mb-[18px] h-px"
          style={{ background: "var(--gold)", opacity: 0.4 }}
        />

        <motion.p
          initial={getInitial(0)}
          animate={getAnimate(0)}
          transition={getTransition(0.22)}
          className="mb-6 text-[13px] font-light italic"
          style={{
            color: "var(--cream-mid)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.75,
            opacity: 0.75,
          }}
        >
          {`«\u00a0${virtue.maxim}\u00a0»`}
        </motion.p>

        <motion.div
          initial={getInitial(0)}
          animate={getAnimate(0)}
          transition={getTransition(0.3)}
        >
          {reflectionParagraphs.map((paragraph, index) => (
            <p
              key={`${virtue.id}-${index}`}
              className="text-[16px] font-light"
              style={{
                color: "var(--cream-mid)",
                fontFamily: "var(--font-display)",
                lineHeight: 1.7,
                marginBottom: "12px",
                opacity: 0.7,
              }}
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
