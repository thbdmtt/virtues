"use client";

import { useEffect, useRef } from "react";

import type { CycleSegment } from "@/types";

type CycleDialProps = {
  currentCycleWeek: number;
  segments: CycleSegment[];
};

const CANVAS_SIZE = 260;

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
    return getTokenValue(styles, "--gold-trace-strong");
  }

  if ((segment.score ?? 0) === 0) {
    return getTokenValue(styles, "--cycle-dial-zero");
  }

  if ((segment.score ?? 0) <= 3) {
    return getTokenValue(styles, "--cycle-dial-low");
  }

  if ((segment.score ?? 0) <= 7) {
    return getTokenValue(styles, "--cycle-dial-mid");
  }

  return getTokenValue(styles, "--cycle-dial-high");
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
  const centerX = CANVAS_SIZE / 2;
  const centerY = CANVAS_SIZE / 2;
  const outerRadius = CANVAS_SIZE * 0.44;
  const innerRadius = CANVAS_SIZE * 0.3;
  const holeRadius = innerRadius - 2;
  const segmentGap = 0.035;
  const segmentCount = segments.length;

  canvas.width = CANVAS_SIZE * ratio;
  canvas.height = CANVAS_SIZE * ratio;
  canvas.style.width = `${CANVAS_SIZE}px`;
  canvas.style.height = `${CANVAS_SIZE}px`;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.scale(ratio, ratio);
  context.lineJoin = "round";

  segments.forEach((segment, index) => {
    const startAngle =
      (index / segmentCount) * Math.PI * 2 - Math.PI / 2 + segmentGap;
    const endAngle =
      ((index + 1) / segmentCount) * Math.PI * 2 - Math.PI / 2 - segmentGap;

    context.save();
    context.beginPath();
    context.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    context.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    context.closePath();
    context.fillStyle = getSegmentFillColor(styles, segment);
    context.globalAlpha = segment.state === "future" ? 0.4 : 1;
    context.fill();
    context.globalAlpha = 1;

    if (segment.state === "current") {
      context.lineWidth = 1;
      context.strokeStyle = gold;
      context.stroke();
    }

    context.restore();
  });

  context.beginPath();
  context.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
  context.fillStyle = voidColor;
  context.fill();

  context.fillStyle = cream;
  context.font = `300 28px ${displayFont}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(currentCycleWeek), centerX, centerY - 10);

  context.fillStyle = creamDim;
  context.font = `300 7px ${bodyFont}`;
  drawSpacedText(context, "SEMAINE", centerX, centerY + 14, 1.4);
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
