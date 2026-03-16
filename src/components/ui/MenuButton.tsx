"use client";

type MenuButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export default function MenuButton({ isOpen, onToggle }: MenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
      aria-pressed={isOpen}
      onClick={onToggle}
      className="tracker-focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full"
      style={{
        backgroundColor: "color-mix(in srgb, var(--surface) 86%, transparent)",
        transition:
          "background-color var(--transition-base), transform var(--transition-base)",
      }}
    >
      <span className="flex flex-col gap-[5px]">
        <span
          className="block h-px"
          style={{
            width: isOpen ? "18px" : "20px",
            backgroundColor: "var(--cream-dim)",
            transform: isOpen ? "translateY(3px) rotate(45deg)" : "none",
            transition:
              "transform var(--transition-base), width var(--transition-base), background-color var(--transition-base)",
          }}
        />
        <span
          className="block h-px"
          style={{
            width: isOpen ? "18px" : "13px",
            backgroundColor: "var(--cream-dim)",
            transform: isOpen ? "translateY(-3px) rotate(-45deg)" : "none",
            transition:
              "transform var(--transition-base), width var(--transition-base), background-color var(--transition-base)",
          }}
        />
      </span>
    </button>
  );
}
