"use client";

import { useRouter } from "next/navigation";

import type { Virtue } from "@/types";

type Props = {
  virtue: Virtue;
  isFocus: boolean;
};

function getSentences(reflection: string): string[] {
  return reflection
    ? reflection
        .split(/(?<=\.)\s+/)
        .filter((sentence) => sentence.trim().length > 0)
    : [];
}

function getVirtueNumberLabel(id: number): string {
  return id < 10 ? `0 ${id}` : String(id);
}

export default function VirtueDetail({ virtue, isFocus }: Props) {
  const router = useRouter();
  const sentences = getSentences(virtue.reflection);
  const numDisplay = getVirtueNumberLabel(virtue.id);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--void)",
        display: "flex",
        flexDirection: "column",
        paddingTop: "max(var(--safe-top), 52px)",
        paddingLeft: "calc(28px + var(--safe-left))",
        paddingRight: "calc(28px + var(--safe-right))",
        paddingBottom: "max(var(--safe-bottom), 40px)",
        overflowY: "auto",
      }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="tracker-focus-ring"
        style={{
          background: "none",
          border: "none",
          color: "var(--cream-dim)",
          fontSize: "16px",
          opacity: 0.6,
          cursor: "pointer",
          padding: "0",
          marginBottom: "28px",
          textAlign: "left",
          fontFamily: "var(--font-body)",
          letterSpacing: "0.05em",
          alignSelf: "flex-start",
        }}
      >
        ←
      </button>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "9px",
          fontWeight: 300,
          letterSpacing: "0.4em",
          color: "var(--gold-soft)",
          marginBottom: "6px",
        }}
      >
        {numDisplay}
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(48px, 12vw, 64px)",
          fontWeight: 300,
          color: "var(--cream)",
          letterSpacing: "-0.025em",
          lineHeight: 0.9,
          marginBottom: "14px",
        }}
      >
        {virtue.nameFr}
      </div>

      <div
        style={{
          width: "40px",
          height: "1px",
          background: "var(--gold)",
          opacity: 0.4,
          marginBottom: "18px",
        }}
      />

      {virtue.maxim ? (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--cream-mid)",
            opacity: 0.8,
            lineHeight: 1.75,
            marginBottom: "28px",
          }}
        >
          {`«\u00a0${virtue.maxim}\u00a0»`}
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {sentences.map((sentence, index) => (
          <p
            key={`${virtue.id}-${index}`}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: 300,
              color: "var(--cream-mid)",
              opacity: 0.72,
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            {sentence}
          </p>
        ))}
      </div>

      {isFocus ? (
        <div
          style={{
            marginTop: "40px",
            fontFamily: "var(--font-body)",
            fontSize: "8px",
            letterSpacing: "0.25em",
            color: "var(--gold-soft)",
            opacity: 0.6,
            textTransform: "uppercase",
          }}
        >
          · Vertu de la semaine ·
        </div>
      ) : null}
    </div>
  );
}
