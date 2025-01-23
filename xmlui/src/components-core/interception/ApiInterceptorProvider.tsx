import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { SetupWorker } from "msw/browser";
import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";

import { ApiInterceptorContext } from "./useApiInterceptorContext";
import type { IApiInterceptorContext } from "@abstractions/AppContextDefs";
import { normalizePath } from "@components-core/utils/misc";

// This React component injects the API interceptor into the application's context
export function ApiInterceptorProvider({
  interceptor,
  children,
  apiWorker,
  useHashBasedRouting,
}: {
  interceptor?: ApiInterceptorDefinition;
  children: ReactNode;
  apiWorker?: SetupWorker;
  useHashBasedRouting?: boolean;
}) {
  const [initialized, setInitialized] = useState(!interceptor);

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
      isMocked: (url) => interceptor !== undefined && !!process.env.VITE_MOCK_ENABLED,
    };
  }, [interceptor]);

  return (
    <ApiInterceptorContext.Provider value={contextValue}>
      {initialized ? children || null : null}
    </ApiInterceptorContext.Provider>
  );
}
