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

export default function VirtueDetail({
  virtue,
  isCurrentFocus,
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
          "calc(var(--safe-top) + 20px) calc(28px + var(--safe-right)) calc(var(--safe-bottom) + 28px) calc(28px + var(--safe-left))",
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
          className="tracker-focus-ring mb-6 w-fit text-[11px] font-light hover:opacity-90"
          style={{
            color: "var(--cream-dim)",
            fontFamily: "var(--font-body)",
            opacity: 0.5,
            transition: "opacity var(--transition-base)",
          }}
        >
          ←
        </button>

        <motion.p
          initial={getInitial(8)}
          animate={getAnimate(8)}
          transition={getTransition(0)}
          className="mb-2 text-[8px] font-light uppercase tracking-[0.4em]"
          style={{ color: "var(--gold-soft)", fontFamily: "var(--font-body)" }}
        >
          {getVirtueNumber(virtue.id)}
        </motion.p>

        <motion.h1
          initial={getInitial(12)}
          animate={getAnimate(12)}
          transition={getTransition(0.08)}
          className="mb-4 text-[clamp(48px,12vw,64px)] font-light leading-[0.88] tracking-[-0.025em]"
          style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
        >
          {virtue.nameFr}
        </motion.h1>

        <motion.div
          initial={shouldReduceMotion ? { width: 32 } : { width: 0 }}
          animate={{ width: 32 }}
          transition={getTransition(0.16)}
          className="mb-[18px] h-px"
          style={{ background: "var(--gold)", opacity: 0.4 }}
        />

        <motion.p
          initial={getInitial(0)}
          animate={getAnimate(0)}
          transition={getTransition(0.22)}
          className="mb-7 text-[14px] font-light italic"
          style={{
            color: "var(--cream-mid)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.75,
            opacity: 0.8,
          }}
        >
          « {virtue.maxim} »
        </motion.p>

        <motion.div
          initial={getInitial(0)}
          animate={getAnimate(0)}
          transition={getTransition(0.3)}
          className="space-y-[14px]"
        >
          {reflectionParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] font-light"
              style={{
                color: "var(--cream-mid)",
                fontFamily: "var(--font-display)",
                lineHeight: 1.7,
                opacity: 0.72,
              }}
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        {isCurrentFocus ? (
          <p
            className="mt-auto pt-10 text-center text-[8px] font-light uppercase tracking-[0.25em]"
            style={{
              color: "var(--gold-soft)",
              fontFamily: "var(--font-body)",
              opacity: 0.6,
            }}
          >
            · Vertu de la semaine ·
          </p>
        ) : null}
      </div>
    </main>
  );
}
