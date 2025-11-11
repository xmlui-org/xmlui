export const EMPTY_ARRAY: Array<any> = Object.freeze([]) as unknown as Array<any>;
export const EMPTY_OBJECT = Object.freeze({}) as unknown as {};
export const noop = (...args: any[]) => ({}) as any;
export const asyncNoop = async (...args: any[]) => {};
