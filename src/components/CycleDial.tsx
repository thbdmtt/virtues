"use client";

import { useEffect, useRef } from "react";

import { getDialScoreTone } from "@/lib/utils/cycleStats";
import type { CycleSegment } from "@/types";

type CycleDialProps = {
  currentCycleWeek: number;
  segments: CycleSegment[];
};

const CANVAS_SIZE = 260;
const CENTER = CANVAS_SIZE / 2;
const OUTER_RADIUS = 118;
const INNER_RADIUS = 86;
const HOLE_RADIUS = 68;
const SEGMENT_GAP = 0.08;

function getTokenValue(styles: CSSStyleDeclaration, token: string): string {
  return styles.getPropertyValue(token).trim();
}

function drawSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  const totalWidth = text.split("").reduce((width, character, index) => {
    const characterWidth = context.measureText(character).width;

    return width + characterWidth + (index === text.length - 1 ? 0 : spacing);
  }, 0);
  let cursor = x - totalWidth / 2;

  for (const character of text) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + spacing;
  }
}

function getSegmentFillColor(
  styles: CSSStyleDeclaration,
  segment: CycleSegment,
): string {
  if (segment.state === "future") {
    return getTokenValue(styles, "--surface");
  }

  if (segment.state === "current") {
    return getTokenValue(styles, "--gold-trace");
  }

  switch (getDialScoreTone(segment.score ?? 0)) {
    case "low":
      return getTokenValue(styles, "--cycle-dial-low");
    case "mid":
      return getTokenValue(styles, "--cycle-dial-mid");
    case "high":
      return getTokenValue(styles, "--cycle-dial-high");
    case "critical":
      return getTokenValue(styles, "--cycle-dial-critical");
  }
}

function drawCycle(
  canvas: HTMLCanvasElement,
  currentCycleWeek: number,
  segments: CycleSegment[],
) {
  const ratio = window.devicePixelRatio || 1;
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const styles = getComputedStyle(document.documentElement);
  const gold = getTokenValue(styles, "--gold");
  const cream = getTokenValue(styles, "--cream");
  const creamDim = getTokenValue(styles, "--cream-dim");
  const displayFont = getTokenValue(styles, "--font-display") || "serif";
  const bodyFont = getTokenValue(styles, "--font-body") || "sans-serif";
  const voidColor = getTokenValue(styles, "--void");
  const segmentAngle = (Math.PI * 2) / segments.length;

  canvas.width = CANVAS_SIZE * ratio;
  canvas.height = CANVAS_SIZE * ratio;
  canvas.style.width = `${CANVAS_SIZE}px`;
  canvas.style.height = `${CANVAS_SIZE}px`;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.scale(ratio, ratio);
  context.lineJoin = "round";

  segments.forEach((segment, index) => {
    const startAngle = -Math.PI / 2 + index * segmentAngle + SEGMENT_GAP / 2;
    const endAngle = -Math.PI / 2 + (index + 1) * segmentAngle - SEGMENT_GAP / 2;

    context.save();
    context.beginPath();
    context.arc(CENTER, CENTER, OUTER_RADIUS, startAngle, endAngle);
    context.arc(CENTER, CENTER, INNER_RADIUS, endAngle, startAngle, true);
    context.closePath();
    context.fillStyle = getSegmentFillColor(styles, segment);
    context.globalAlpha = segment.state === "future" ? 0.4 : 1;
    context.fill();
    context.globalAlpha = 1;

    if (segment.state === "current") {
      context.lineWidth = 1.5;
      context.strokeStyle = gold;
      context.stroke();
    }

    context.restore();
  });

  context.beginPath();
  context.arc(CENTER, CENTER, HOLE_RADIUS, 0, Math.PI * 2);
  context.fillStyle = voidColor;
  context.fill();

  context.fillStyle = cream;
  context.font = `300 32px ${displayFont}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(currentCycleWeek), CENTER, CENTER - 12);

  context.fillStyle = creamDim;
  context.font = `300 8px ${bodyFont}`;
  drawSpacedText(context, "SEMAINE", CENTER, CENTER + 14, 2);
}

export default function CycleDial({
  currentCycleWeek,
  segments,
}: CycleDialProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    drawCycle(canvas, currentCycleWeek, segments);
  }, [currentCycleWeek, segments]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      aria-label={`Cycle des 13 semaines, semaine ${currentCycleWeek}`}
      className="mx-auto"
    />
  );
}
