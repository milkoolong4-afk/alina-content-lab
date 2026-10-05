import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Fonts are self-hosted in /public/fonts (OFL, see LICENSE-*.txt) — renders
 * work offline and never depend on Google Fonts being reachable.
 *
 * display — Inter Tight, heavy grotesk for statements (the main voice)
 * serif   — Playfair Display italic, editorial contrast / ironic asides
 * hand    — Caveat, handwritten annotations ("это я", arrows, circles)
 * mono    — JetBrains Mono, UI / code / terminal / counters
 */
export const font = {
  display: "ACL Display",
  serif: "ACL Serif",
  hand: "ACL Hand",
  mono: "ACL Mono",
} as const;

export type FontName = keyof typeof font;

const RANGES = {
  latin:
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  cyrillic: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
};

type Face = { family: string; file: string; weight: string; style?: "normal" | "italic" };

const FACES: Face[] = [
  { family: font.display, file: "inter-tight", weight: "600" },
  { family: font.display, file: "inter-tight", weight: "800" },
  { family: font.display, file: "inter-tight", weight: "900" },
  { family: font.display, file: "inter-tight", weight: "900", style: "italic" },
  { family: font.serif, file: "playfair-display", weight: "700", style: "italic" },
  { family: font.serif, file: "playfair-display", weight: "900", style: "italic" },
  { family: font.hand, file: "caveat", weight: "700" },
  { family: font.mono, file: "jetbrains-mono", weight: "500" },
  { family: font.mono, file: "jetbrains-mono", weight: "700" },
];

let loaded = false;

const loadAll = () => {
  if (loaded || typeof document === "undefined" || typeof FontFace === "undefined") return;
  loaded = true;
  const handle = delayRender("Loading fonts");
  const jobs = FACES.flatMap((f) =>
    (Object.keys(RANGES) as Array<keyof typeof RANGES>).map((subset) => {
      const style = f.style ?? "normal";
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}-${subset}-${f.weight}-${style}.woff2`)}) format("woff2")`, {
        weight: f.weight,
        style,
        unicodeRange: RANGES[subset],
      });
      document.fonts.add(face);
      return face.load();
    }),
  );
  Promise.all(jobs)
    .catch((err) => console.warn("Font load failed", err))
    .finally(() => continueRender(handle));
};

loadAll();
