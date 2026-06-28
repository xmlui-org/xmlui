export const EMPTY_ARRAY = Object.freeze([]) as unknown as Array<unknown>;
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>;
export const noop = (..._args: unknown[]) => undefined;
export const asyncNoop = async (..._args: unknown[]) => undefined;
