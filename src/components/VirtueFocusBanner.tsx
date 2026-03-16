"use client";

import { motion, type Transition } from "framer-motion";

type VirtueFocusBannerProps = {
  name: string;
  description: string;
};

const BANNER_TRANSITION = {
  duration: 0.28,
  ease: "easeOut",
} satisfies Transition;

export default function VirtueFocusBanner({
  name,
  description,
}: VirtueFocusBannerProps) {
  return (
    <motion.section
      className="rounded-[28px] border px-5 py-6 sm:px-6 sm:py-6"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={BANNER_TRANSITION}
      style={{
        fontFamily: "var(--font-body)",
        borderColor:
          "color-mix(in srgb, var(--accent-gold) 56%, var(--border-soft))",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-panel-strong) 82%, var(--bg-elevated)), var(--bg-panel))",
        boxShadow: "var(--shadow-soft), var(--shadow-inset)",
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-start">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-3 h-px w-8 shrink-0"
            style={{ backgroundColor: "var(--accent-gold)" }}
          />
          <div className="space-y-2">
            <p
              className="text-[11px] uppercase tracking-[0.28em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Vertu de la semaine
            </p>
            <h2
              className="text-[clamp(2rem,4vw,3.35rem)] leading-[0.94]"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {name}
            </h2>
          </div>
        </div>
        <div
          className="rounded-[22px] border px-4 py-4 sm:px-5"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor:
              "color-mix(in srgb, var(--bg-panel-soft) 80%, var(--bg-panel))",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Maxime
          </p>
          <p
            className="mt-3 sm:text-lg"
            style={{
              color: "var(--text-primary)",
              fontSize: "var(--text-maxim-size)",
              lineHeight: "var(--text-maxim-line-height)",
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
