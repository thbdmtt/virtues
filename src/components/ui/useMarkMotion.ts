"use client";

import { useEffect } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";

import type { MarkChange } from "./useMarkState";

type UseMarkMotionOptions = {
  changeKind: MarkChange;
  glowShadow: string;
  isMarked: boolean;
};

async function runMarkSequence(
  animate: ReturnType<typeof useAnimate>[1],
  element: Element,
) {
  await animate(
    element,
    { scale: 1.22 },
    { type: "spring", stiffness: 400, damping: 25, mass: 0.45, duration: 0.08 },
  );
  await animate(
    element,
    { scale: 0.95 },
    { type: "spring", stiffness: 400, damping: 25, mass: 0.45, duration: 0.08 },
  );
  await animate(
    element,
    { scale: 1.05 },
    { type: "spring", stiffness: 400, damping: 25, mass: 0.45, duration: 0.08 },
  );
  await animate(
    element,
    { scale: 1 },
    { type: "spring", stiffness: 400, damping: 25, mass: 0.45, duration: 0.08 },
  );
}

async function runClearSequence(
  animate: ReturnType<typeof useAnimate>[1],
  element: Element,
) {
  await animate(element, { scale: 0.85 }, { duration: 0.1, ease: "easeOut" });
  await animate(element, { scale: 1 }, { duration: 0.1, ease: "easeOut" });
}

export function useMarkMotion({
  changeKind,
  glowShadow,
  isMarked,
}: UseMarkMotionOptions) {
  const [shellRef, animateShell] = useAnimate();
  const [glowRef, animateGlow] = useAnimate();
  const shouldReduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const shell = shellRef.current;
    const glow = glowRef.current;

    if (!shell || !glow) {
      return;
    }

    if (shouldReduceMotion) {
      void animateShell(shell, { scale: 1 }, { duration: 0.15, ease: "easeOut" });
      void animateGlow(
        glow,
        { opacity: isMarked ? 0.5 : 0 },
        { duration: 0.15, ease: "easeOut" },
      );
      return;
    }

    if (changeKind === "mark") {
      void animateGlow(
        glow,
        { opacity: [0, 0.8, 0.5] },
        { duration: 0.32, times: [0, 0.55, 1], ease: "easeOut" },
      );
      void runMarkSequence(animateShell, shell);
      return;
    }

    if (changeKind === "clear") {
      void animateGlow(glow, { opacity: 0 }, { duration: 0.15, ease: "easeOut" });
      void runClearSequence(animateShell, shell);
      return;
    }

    void animateShell(shell, { scale: 1 }, { duration: 0.15, ease: "easeOut" });
    void animateGlow(
      glow,
      {
        opacity: isMarked ? 0.5 : 0,
        boxShadow: glowShadow,
      },
      { duration: 0.15, ease: "easeOut" },
    );
  }, [
    animateGlow,
    animateShell,
    changeKind,
    glowRef,
    glowShadow,
    isMarked,
    shellRef,
    shouldReduceMotion,
  ]);

  return {
    glowRef,
    shellRef,
    shouldReduceMotion,
  };
}
