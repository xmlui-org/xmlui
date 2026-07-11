export type ApiInterceptorOperation = {
  url: string;
  method?: string;
  status?: number;
  handler?: string;
};

export type ApiInterceptorDefinition = {
  initialize?: string;
  operations?: Record<string, ApiInterceptorOperation>;
};
