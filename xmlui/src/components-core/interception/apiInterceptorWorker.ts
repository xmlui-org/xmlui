import type { SetupWorker } from "msw/browser";
import { setupWorker } from "msw/browser";
import type { RequestHandler } from "msw";
import { http } from "msw";
import { isArray } from "lodash-es";

import { ApiInterceptor } from "./ApiInterceptor";
import type { ApiInterceptorDefinition } from "./abstractions";

// Create handlers for the specified API interceptor
function createHandlers(api: ApiInterceptor) {
  const operations = api.getOperations();
  let handlers: Array<RequestHandler> = [];
  Object.entries(operations).forEach(([operationId, operation]) => {
    let urls = [operation.url];
    if (isArray(operation.url)) {
      urls = operation.url;
    }
    urls.forEach((operationUrl) => {
      handlers.push(
        http[operation.method](
          `${api.getApiUrl()}${operationUrl}`,
          async ({ request, cookies, params }) => {
            return await api.executeOperation(operationId, request, cookies, params);
          },
        ),
      );
    });
  });
  return handlers;
}

// Create the worker for the ApiInterceptorProvider
export const createApiInterceptorWorker = async (
  apiInterceptorDefinition: ApiInterceptorDefinition,
  apiWorker: SetupWorker | null,
) => {
  const apiInstance = new ApiInterceptor(apiInterceptorDefinition);
  await apiInstance.initialize();
  const handlers = createHandlers(apiInstance);
  let worker = apiWorker;
  if (!worker) {
    worker = setupWorker();
  }
  // https://github.com/mswjs/msw/issues/2495
  worker.use(...handlers as any);
  return worker;
};
