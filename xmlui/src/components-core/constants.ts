export const EMPTY_ARRAY: Array<any> = Object.freeze([]) as unknown as Array<any>;
export const EMPTY_OBJECT = Object.freeze({}) as unknown as Record<string, any>;
export const noop = (..._args: any[]) => ({}) as any;
export const asyncNoop = async (..._args: any[]) => {};
