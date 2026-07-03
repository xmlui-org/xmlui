export function mergeProps<T extends Record<string, unknown>>(
  ...props: Array<T | undefined>
): T {
  return Object.assign({}, ...props.filter(Boolean));
}
