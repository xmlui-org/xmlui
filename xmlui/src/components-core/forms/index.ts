export type ValidatorEntry = {
  fn: (value: unknown, context?: unknown, params?: unknown) => string | null | undefined;
};

export function lookupValidator(_name: string): ValidatorEntry | undefined {
  return undefined;
}
