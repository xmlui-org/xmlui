export function generateColorPalette({
  count,
  baseColors = [],
}: {
  count: number;
  baseColors: string[];
}): string[] {
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  const extraCount = count - baseColors.length;

  const hslExtras = Array.from({ length: extraCount }, (_, i) => {
    const hue = Math.round((360 / extraCount) * i);
    const saturation = 70;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });

  return [...baseColors, ...hslExtras];
}
