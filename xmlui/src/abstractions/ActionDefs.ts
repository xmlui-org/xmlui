export type ActionExecutionContext = {
  appContext?: any;
  [key: string]: any;
};

export type LookupAsyncFnInner = (
  expression?: string,
  uid?: symbol,
  options?: Record<string, unknown>,
) => ((...args: any[]) => Promise<any>) | undefined;
