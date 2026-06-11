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
  if (parentWorker) {
    // Nested interceptor: add handlers on top of the parent worker.
    // https://github.com/mswjs/msw/issues/2495
    parentWorker.use(...(handlers as any));
    return parentWorker;
  }
  // Reuse a single SetupWorker instance for the page lifetime instead of
  // creating a fresh one on every (re)initialization. Multiple SetupWorker
  // instances fighting over the same Service Worker registration race when one
  // is torn down (stop()) while another starts up (start()) — the deactivation
  // message can win and silently disable mocking, so requests fall through
  // unhandled. This surfaced as flaky E2E tests (forms stuck "Saving...",
  // DataSource never firing onLoaded) because the test bed remounts the whole
  // app between tests and each remount re-created + stopped the worker.
  if (!cachedWorker) {
    cachedWorker = setupWorker();
    serializeWorkerLifecycle(cachedWorker);
  }
  // Replace (not accumulate) handlers so each (re)initialization starts from a
  // clean set and a previous test's handlers can't intercept the next test's
  // requests.
  cachedWorker.resetHandlers(...(handlers as any));
  return cachedWorker;
};

// Module-level cached worker (see createApiInterceptorWorker for rationale).
let cachedWorker: SetupWorker | undefined;

// Serializes start()/stop() so they never overlap.
//
// The provider calls start() when an interceptor mounts and stop() during its
// cleanup. Because the test bed remounts the app between tests, a stop() from
// the outgoing test and a start() from the incoming test can otherwise overlap:
// MSW's stop() asynchronously deactivates the Service Worker while start() is
// concurrently re-activating it, and the deactivation can win — leaving mocking
// silently disabled (the documented cause of flaky DataSource/Form tests).
//
// Chaining every start()/stop() onto a single promise guarantees the previous
// operation fully settles before the next begins, so back-to-back interceptor
// tests get a coherent activate-after-deactivate sequence. We still let stop()
// run for tests with no interceptor: a deactivated SW stops calling
// respondWith(), so the browser performs fetches from the page context where
// Playwright's page.route() can intercept them (an active SW would handle the
// fetch itself, bypassing page.route()).
function serializeWorkerLifecycle(worker: SetupWorker) {
  const realStart = worker.start.bind(worker);
  const realStop = worker.stop.bind(worker);
  let lifecycle: Promise<unknown> = Promise.resolve();

  worker.start = ((options?: Parameters<SetupWorker["start"]>[0]) => {
    lifecycle = lifecycle.then(
      () => realStart(options),
      () => realStart(options),
    );
    return lifecycle as ReturnType<SetupWorker["start"]>;
  }) as SetupWorker["start"];

  worker.stop = (() => {
    lifecycle = lifecycle.then(
      () => realStop(),
      () => realStop(),
    );
  }) as SetupWorker["stop"];
}
