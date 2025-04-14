export function generateColorPalette({ count }: { count: number }): string[] {
  const baseColors = [
    "#008FFB",
    "#00E396",
    "#FEB019",
    "#FF4560",
    "#775DD0",
    "#588dd5",
    "#2ec7c9",
    "#b6a2de",
    "#5ab1ef",
    "#ffb980",
    "#d87a80",
    "#8d98b3",
    "#e5cf0d",
    "#97b552",
    "#95706d",
    "#dc69aa",
    "#07a2a4",
    "#9a7fd1",
    "#f5994e",
    "#c05050",
    "#59678c",
    "#c9ab00",
    "#7eb00a",
    "#6f5553",
    "#c14089",
  ];
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
