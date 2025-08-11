import { ApiInterceptor } from "./ApiInterceptor";
import type { ApiInterceptorDefinition } from "./abstractions";

// Create the worker for the ApiInterceptorProvider
export const initMock = async (apiInterceptorDefinition: ApiInterceptorDefinition) => {
  const apiInstance = new ApiInterceptor(apiInterceptorDefinition);
  await apiInstance.initialize();
  return apiInstance;
};
