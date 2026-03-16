import type { Virtue } from "@/types";

type VirtueSidebarProps = {
  virtues: Virtue[];
  focusVirtueId: number;
};

function getVirtueNumberLabel(id: number): string {
  return id.toString().padStart(2, "0");
}

export default function VirtueSidebar({
  virtues,
  focusVirtueId,
}: VirtueSidebarProps) {
  return (
    <aside
      className="relative w-full border-b px-6 pb-[calc(2rem+var(--safe-bottom))] pt-[calc(2rem+var(--safe-top))] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-7 lg:pb-[calc(2.5rem+var(--safe-bottom))] lg:pt-[calc(2.5rem+var(--safe-top))]"
      style={{
        fontFamily: "var(--font-body)",
        borderColor: "var(--border-soft)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-sidebar) 92%, var(--bg-base)), var(--bg-base))",
        boxShadow: "inset -1px 0 0 var(--overlay-soft)",
      }}
    >
      <div className="flex h-full flex-col gap-7">
        <div className="space-y-3">
          <p
            className="text-[11px] uppercase tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Canon Franklin
          </p>
          <h2 className="text-[2rem] leading-none text-[var(--text-primary)]">
            Les {virtues.length} vertus
          </h2>
          <p className="max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
            Ordre canonique, nom français dominant, maxime au survol.
          </p>
        </div>
        <ol className="max-h-[min(60vh,44rem)] space-y-2.5 overflow-y-auto pr-2 lg:max-h-[calc(100vh-var(--safe-top)-var(--safe-bottom)-12rem)]">
          {virtues.map((virtue) => {
            const isFocusVirtue = virtue.id === focusVirtueId;

            return (
              <li key={virtue.id}>
                <div
                  title={virtue.description}
                  tabIndex={0}
                  className="tracker-focus-ring group relative overflow-hidden rounded-[24px] border px-4 py-4 outline-none hover:-translate-y-px"
                  style={{
                    borderColor: isFocusVirtue
                      ? "var(--border-strong)"
                      : "var(--border-soft)",
                    background: isFocusVirtue
                      ? "linear-gradient(180deg, color-mix(in srgb, var(--accent-gold) 6%, var(--bg-panel-soft)), var(--bg-panel))"
                      : "linear-gradient(180deg, color-mix(in srgb, var(--bg-panel-soft) 78%, var(--bg-sidebar)), var(--bg-panel))",
                    boxShadow: isFocusVirtue
                      ? "var(--shadow-soft), inset 0 1px 0 var(--overlay-strong)"
                      : "inset 0 1px 0 var(--overlay-soft)",
                    transition:
                      "transform var(--transition-base), border-color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-5 top-0 h-px"
                    style={{
                      background: isFocusVirtue
                        ? "linear-gradient(90deg, transparent, var(--overlay-strong), transparent)"
                        : "linear-gradient(90deg, transparent, var(--overlay-soft), transparent)",
                    }}
                  />
                  {isFocusVirtue ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-4 left-0 top-4 w-px rounded-full"
                      style={{ backgroundColor: "var(--accent-gold)" }}
                    />
                  ) : null}
                  <span
                    className="mt-0.5 text-[10px] uppercase tracking-[0.26em]"
                    style={{
                      color: isFocusVirtue
                        ? "var(--accent-gold)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {getVirtueNumberLabel(virtue.id)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="truncate text-[15px] font-medium leading-5"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {virtue.nameFr}
                      </p>
                      {isFocusVirtue ? (
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: "var(--accent-gold)",
                            boxShadow:
                              "0 0 0 6px color-mix(in srgb, var(--accent-gold) 16%, transparent)",
                          }}
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      {virtue.nameEn}
                    </p>
                  </div>
                  {isFocusVirtue ? (
                    <span
                      className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
                      style={{
                        borderColor: "var(--accent-gold-dim)",
                        color: "var(--accent-gold)",
                        backgroundColor:
                          "color-mix(in srgb, var(--accent-gold) 8%, transparent)",
                      }}
                    >
                      Focus
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
