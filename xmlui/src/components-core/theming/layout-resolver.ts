export function toCssVar(value: string): string {
  return value.startsWith("$") ? `var(--xmlui-${value.slice(1)})` : value;
}
