import { createContext, useContext } from "react";

import type { IApiInterceptorContext } from "../../abstractions/AppContextDefs";

export const ApiInterceptorContext = createContext<IApiInterceptorContext>(null as any);

export function useApiInterceptorContext() {
  return useContext(ApiInterceptorContext);
}
