type ScreenWeekPanelProps = {
  weekLabel: string;
  weekScore: number;
};

type MenuPanelProps = {
  isOpen: boolean;
  weekLabel: string;
  weekScore: number;
  virtueCount: number;
};

export function ScreenWeekPanel({
  weekLabel,
  weekScore,
}: ScreenWeekPanelProps) {
  return (
    <section
      className="pointer-events-none absolute inset-0 flex items-end"
      aria-label="Écran semaine"
      style={{
        padding:
          "max(var(--safe-top), 132px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 48px) calc(28px + var(--safe-left))",
        opacity: 0,
        transform: "translateY(8%)",
        transition:
          "opacity var(--t-mid) var(--ease), transform var(--t-mid) var(--ease)",
      }}
    >
      <div
        className="w-full rounded-[32px] border px-6 py-8"
        style={{
          borderColor: "color-mix(in srgb, var(--cream-dim) 24%, transparent)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--deep) 94%, var(--void)), color-mix(in srgb, var(--void) 96%, transparent))",
        }}
      >
        <p
          className="text-[9px] font-light uppercase tracking-[0.35em]"
          style={{ color: "var(--cream-dim)" }}
        >
          Semaine
        </p>
        <p
          className="mt-4 text-[clamp(2rem,8vw,3rem)] leading-none"
          style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
        >
          {weekLabel}
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--cream-mid)" }}>
          Score en cours : {weekScore}
        </p>
      </div>
    </section>
  );
}

export function MenuPanel({
  isOpen,
  weekLabel,
  weekScore,
  virtueCount,
}: MenuPanelProps) {
  return (
    <aside
      className="fixed inset-0 z-[500]"
      aria-hidden={!isOpen}
      style={{
        padding:
          "max(var(--safe-top), 92px) calc(28px + var(--safe-right)) max(var(--safe-bottom), 28px) calc(28px + var(--safe-left))",
        backgroundColor: "color-mix(in srgb, var(--void) 94%, transparent)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transform: isOpen ? "translateX(0)" : "translateX(16px)",
        transition:
          "opacity var(--t-mid) var(--ease), transform var(--t-mid) var(--ease)",
      }}
    >
      <div
        className="ml-auto flex h-full max-w-[22rem] flex-col rounded-[32px] border px-6 py-7"
        style={{
          borderColor: "var(--gold-line)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, var(--deep)), color-mix(in srgb, var(--deep) 92%, var(--void)))",
          boxShadow: "var(--shadow-panel), var(--shadow-inset)",
        }}
      >
        <p
          className="text-[9px] font-light uppercase tracking-[0.35em]"
          style={{ color: "var(--gold-soft)" }}
        >
          Menu
        </p>
        <div className="mt-8 space-y-5">
          <div>
            <p className="text-[11px]" style={{ color: "var(--cream-dim)" }}>
              Semaine affichée
            </p>
            <p
              className="mt-2 text-[2rem] leading-none"
              style={{ color: "var(--cream)", fontFamily: "var(--font-display)" }}
            >
              {weekLabel}
            </p>
          </div>
          <div>
            <p className="text-[11px]" style={{ color: "var(--cream-dim)" }}>
              Score hebdomadaire
            </p>
            <p
              className="mt-2 text-[2rem] leading-none"
              style={{ color: "var(--cream-mid)", fontFamily: "var(--font-display)" }}
            >
              {weekScore}
            </p>
          </div>
          <div>
            <p className="text-[11px]" style={{ color: "var(--cream-dim)" }}>
              Canon Franklin
            </p>
            <p className="mt-2 text-base" style={{ color: "var(--cream-mid)" }}>
              {virtueCount} vertus prêtes pour la navigation.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
