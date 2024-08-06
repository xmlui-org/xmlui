import { setupWorker } from "msw/browser";
import { isArray } from "lodash-es";
import { RequestHandler, http } from "msw";

import type { ApiInterceptorDefinition } from "./abstractions";

import { ApiInterceptor } from "@components-core/interception/ApiInterceptor";

// Create handlers for the specified API interceptor
function createHandlers(api: ApiInterceptor): RequestHandler[] {
  const operations = api.getOperations();
  let handlers: RequestHandler[] = [];
  Object.entries(operations).forEach(([operationId, operation]) => {
    let urls = [operation.url];
    if (isArray(operation.url)) {
      urls = operation.url;
    }
    urls.forEach((operationUrl) => {
      handlers.push(
        http[operation.method](`${api.getApiUrl()}${operationUrl}`, async ({ request, cookies, params }) => {
          return await api.executeOperation(operationId, request, cookies, params);
        })
      );
    });
  });
  return handlers;
}

// Create the worker for the ApiInterceptorProvider
export const createApiInterceptorWorker = async (apiInterceptorDefinition: ApiInterceptorDefinition) => {
  const apiInstance = new ApiInterceptor(apiInterceptorDefinition);
  await apiInstance.initialize();
  const handlers = createHandlers(apiInstance);
  return setupWorker(...handlers);
};
