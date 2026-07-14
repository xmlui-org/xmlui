import type { A11yDiagnostic } from "./diagnostics";
import { WELL_KNOWN_CONTRAST_PAIRS } from "./wellKnownPairs";

export type ContrastPair = {
  foreground: string;
  background: string;
  minimumRatio?: number;
};

export function checkThemeContrast(
  themeVars: ReadonlyMap<string, string>,
  pairs: readonly ContrastPair[] = WELL_KNOWN_CONTRAST_PAIRS,
): A11yDiagnostic[] {
  const diagnostics: A11yDiagnostic[] = [];
  for (const pair of pairs) {
    const fg = parseColor(themeVars.get(pair.foreground));
    const bg = parseColor(themeVars.get(pair.background));
    if (!fg || !bg) continue;
    const ratio = contrastRatio(fg, bg);
    const minimum = pair.minimumRatio ?? 4.5;
    if (ratio < minimum) {
      diagnostics.push({
        code: "color-contrast-low",
        severity: "warn",
        componentName: "Theme",
        message:
          `Theme contrast is ${ratio.toFixed(2)}:1 for ${pair.foreground} on ` +
          `${pair.background}; expected at least ${minimum}:1.`,
        fix: `Adjust ${pair.foreground} or ${pair.background} to increase contrast.`,
      });
    }
  }
  return diagnostics;
}

export function contrastRatio(
  foreground: [number, number, number],
  background: [number, number, number],
): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export function parseColor(value: string | undefined): [number, number, number] | null {
  if (!value) return null;
  const trimmed = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
  if (hex) {
    const raw = hex[1].length === 3
      ? hex[1].split("").map((c) => `${c}${c}`).join("")
      : hex[1];
    return [
      Number.parseInt(raw.slice(0, 2), 16),
      Number.parseInt(raw.slice(2, 4), 16),
      Number.parseInt(raw.slice(4, 6), 16),
    ];
  }
  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i.exec(trimmed);
  if (rgb) {
    return [clamp255(rgb[1]), clamp255(rgb[2]), clamp255(rgb[3])];
  }
  return null;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function clamp255(value: string): number {
  return Math.max(0, Math.min(255, Number.parseFloat(value)));
}
