export function serializeSpacing(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const rounded = Math.round(value * 10000) / 10000;
  return rounded.toFixed(4).replace(/\.?0+$/, "");
}
