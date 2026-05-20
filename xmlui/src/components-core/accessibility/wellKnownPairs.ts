import type { ContrastPair } from "./contrast";

export const WELL_KNOWN_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { foreground: "textColor", background: "backgroundColor", minimumRatio: 4.5 },
  { foreground: "textColor-primary", background: "backgroundColor", minimumRatio: 4.5 },
  { foreground: "color-error", background: "backgroundColor", minimumRatio: 4.5 },
  { foreground: "textColor-Button-solid", background: "backgroundColor-Button-primary", minimumRatio: 3 },
];
