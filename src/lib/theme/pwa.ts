export type PwaIcon = {
  src: string;
  sizes: string;
  type: "image/png";
  purpose: "any maskable";
};

export type PwaManifest = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: "standalone";
  background_color: string;
  theme_color: string;
  orientation: "portrait-primary";
  icons: readonly PwaIcon[];
};

export const PWA_APP_NAME = "Virtues";
export const PWA_APP_DESCRIPTION = "Treize vertus pour une vie meilleure.";

export const PWA_THEME = {
  backgroundHex: "#111109",
  accentHex: "#C8A84B",
} as const;

export const PWA_ICONS = [
  {
    src: "/icons/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icons/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
] as const satisfies readonly PwaIcon[];

export const PWA_MANIFEST = {
  name: PWA_APP_NAME,
  short_name: PWA_APP_NAME,
  description: PWA_APP_DESCRIPTION,
  start_url: "/",
  display: "standalone",
  background_color: PWA_THEME.backgroundHex,
  theme_color: PWA_THEME.backgroundHex,
  orientation: "portrait-primary",
  icons: PWA_ICONS,
} as const satisfies PwaManifest;
