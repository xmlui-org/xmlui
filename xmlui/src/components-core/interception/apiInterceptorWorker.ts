import type { SetupWorker } from "msw/browser";
import { setupWorker } from "msw/browser";
import type { RequestHandler } from "msw";
import { http } from "msw";
import { isArray } from "lodash-es";

import type { ApiInterceptor } from "./ApiInterceptor";

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
export const createApiInterceptorWorker = (
  apiInstance: ApiInterceptor,
  parentWorker?: SetupWorker,
) => {
  const handlers = createHandlers(apiInstance);
  let worker = parentWorker;
  if (!parentWorker) {
    worker = setupWorker();
  }
  // https://github.com/mswjs/msw/issues/2495
  worker.use(...(handlers as any));
  return worker;
};
