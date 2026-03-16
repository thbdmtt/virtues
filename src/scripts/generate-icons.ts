import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  PWA_MANIFEST,
  PWA_THEME,
} from "../lib/theme/pwa";

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&display=swap";

function getProjectRoot(): string {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));

  return path.resolve(scriptDir, "../..");
}

async function fetchCormorantFontBase64(): Promise<string> {
  const cssResponse = await fetch(FONT_CSS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });

  if (!cssResponse.ok) {
    throw new Error("Failed to fetch Google Fonts CSS for icon generation.");
  }

  const css = await cssResponse.text();
  const fontUrlMatch = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('woff2'\)/);

  if (!fontUrlMatch) {
    throw new Error("Failed to resolve Cormorant Garamond font URL.");
  }

  const fontResponse = await fetch(fontUrlMatch[1]);

  if (!fontResponse.ok) {
    throw new Error("Failed to download Cormorant Garamond font file.");
  }

  const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());

  return fontBuffer.toString("base64");
}

function buildIconSvg(size: number, fontBase64: string): string {
  const fontSize = Math.round(size * 0.68);
  const letterOffsetY = size * 0.56;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <style>
        @font-face {
          font-family: "FranklinIconCormorant";
          src: url("data:font/woff2;base64,${fontBase64}") format("woff2");
          font-style: normal;
          font-weight: 300;
        }

        text {
          fill: ${PWA_THEME.accentHex};
          font-family: "FranklinIconCormorant";
          font-size: ${fontSize}px;
          font-style: normal;
          font-weight: 300;
          letter-spacing: -0.06em;
        }
      </style>
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="${PWA_THEME.backgroundHex}" />
      <text x="50%" y="${letterOffsetY}" text-anchor="middle">F</text>
    </svg>
  `.trim();
}

async function writeIcon(
  outputPath: string,
  size: number,
  fontBase64: string,
): Promise<void> {
  const svg = buildIconSvg(size, fontBase64);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

async function main(): Promise<void> {
  const projectRoot = getProjectRoot();
  const publicDir = path.join(projectRoot, "public");
  const iconsDir = path.join(publicDir, "icons");
  const fontBase64 = await fetchCormorantFontBase64();

  await mkdir(iconsDir, { recursive: true });
  await writeFile(
    path.join(publicDir, "manifest.json"),
    `${JSON.stringify(PWA_MANIFEST, null, 2)}\n`,
    "utf8",
  );
  await writeIcon(path.join(iconsDir, "icon-192.png"), 192, fontBase64);
  await writeIcon(path.join(iconsDir, "icon-512.png"), 512, fontBase64);

  console.log("PWA manifest and icons generated.");
}

main().catch((error: unknown) => {
  console.error("Failed to generate PWA assets.", error);
  process.exitCode = 1;
});
