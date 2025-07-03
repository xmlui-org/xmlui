import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { SetupWorker } from "msw/browser";

import type { IApiInterceptorContext } from "../../abstractions/AppContextDefs";
import type { ApiInterceptorDefinition } from "../interception/abstractions";
import { normalizePath } from "../utils/misc";
import { ApiInterceptorContext } from "./useApiInterceptorContext";

// This React component injects the API interceptor into the application's context
export function ApiInterceptorProvider({
  interceptor,
  children,
  apiWorker,
  useHashBasedRouting,
  waitForApiInterceptor = false
}: {
  interceptor?: ApiInterceptorDefinition;
  children: ReactNode;
  apiWorker?: SetupWorker;
  useHashBasedRouting?: boolean;
  waitForApiInterceptor?: boolean;
}) {
  const [initialized, setInitialized] = useState(!interceptor);
  const [interceptorWorker, setInterceptorWorker] = useState<SetupWorker | null>(null);

  // --- Whenever the interceptor changes, update the provider accordingly
  useEffect(() => {
    if (interceptor) {
      setInitialized(false);

      // --- We use "msw" to manage the API interception
      let interceptorWorker: SetupWorker;
      (async () => {
        // --- Create the worker on the fly
        if (process.env.VITE_MOCK_ENABLED) {
          const { createApiInterceptorWorker } = await import("./apiInterceptorWorker");
          if (interceptor) {
            interceptorWorker = await createApiInterceptorWorker(interceptor, apiWorker);
            setInterceptorWorker(interceptorWorker);
            // if the apiWorker comes from the outside, we don't handle the lifecycle here
            if (!apiWorker) {
              const workerFileLocation = normalizePath(
                process.env.VITE_MOCK_WORKER_LOCATION || "mockServiceWorker.js",
              );
              await interceptorWorker.start({
                onUnhandledRequest: "bypass",
                quiet: true,
                serviceWorker: {
                  url: workerFileLocation,
                },
              });
            }
          }
        }
        setInitialized(true);
      })();
      return () => {
        // if the apiWorker comes from the outside, we don't handle the lifecycle here
        if (!apiWorker) {
          interceptorWorker?.stop();
        }
      };
    }
  }, [apiWorker, interceptor, useHashBasedRouting]);

  const contextValue: IApiInterceptorContext = useMemo(() => {
    return {
      interceptorWorker,
      initialized: initialized,
      isMocked: (url) => interceptor !== undefined && !!process.env.VITE_MOCK_ENABLED,
    };
  }, [interceptorWorker, initialized, interceptor]);

  return (
    <ApiInterceptorContext.Provider value={contextValue}>
      {waitForApiInterceptor && !initialized ? null : children}
    </ApiInterceptorContext.Provider>
  );
}
