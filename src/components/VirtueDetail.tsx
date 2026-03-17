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
    return shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0 };
  }

  function getInitial(y: number) {
    return shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y };
  }

  return (
    <main
      className="min-h-screen"
      style={{
        padding:
          "max(var(--safe-top), 52px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 36px) calc(28px + var(--safe-left))",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-max(var(--safe-top),52px)-max(var(--safe-bottom),36px))] w-full max-w-[680px] flex-col">
        <button
          type="button"
          onClick={() => router.back()}
          className="tracker-focus-ring w-fit text-[11px] font-light hover:opacity-90"
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
          className="mt-5 text-[9px] font-light uppercase tracking-[0.4em]"
          style={{ color: "var(--gold-soft)", fontFamily: "var(--font-body)" }}
        >
          {getVirtueNumber(virtue.id)}
        </motion.p>

        <motion.h1
          initial={getInitial(12)}
          animate={getAnimate(12)}
          transition={getTransition(0.08)}
          className="mt-4 text-[clamp(52px,13vw,68px)] font-light leading-[0.88] tracking-[-0.025em]"
          style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
        >
          {virtue.nameFr}
        </motion.h1>

        <motion.div
          initial={shouldReduceMotion ? { width: 40 } : { width: 0 }}
          animate={{ width: 40 }}
          transition={getTransition(0.16)}
          className="my-5 h-px"
          style={{ background: "var(--gold)", opacity: 0.4 }}
        />

        <motion.p
          initial={getInitial(0)}
          animate={getAnimate(0)}
          transition={getTransition(0.22)}
          className="text-[15px] font-light italic"
          style={{
            color: "var(--cream-mid)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.8,
            opacity: 0.8,
          }}
        >
          « {virtue.maxim} »
        </motion.p>

        <motion.div
          initial={getInitial(0)}
          animate={getAnimate(0)}
          transition={getTransition(0.3)}
          className="mt-8 space-y-[18px]"
          style={{
            color: "var(--cream-mid)",
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            fontWeight: 300,
            lineHeight: 1.9,
            opacity: 0.75,
          }}
        >
          {reflectionParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
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
