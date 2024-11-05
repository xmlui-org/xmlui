import { ReactNode, useEffect, useMemo, useState } from "react";

import type { SetupWorker } from "msw/browser";
import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";

import { ApiInterceptorContext } from "./useApiInterceptorContext";
import { IApiInterceptorContext } from "@abstractions/AppContextDefs";

// This React component injects the API interceptor into the application's context
export function ApiInterceptorProvider({
  interceptor,
  children,
}: {
  interceptor?: ApiInterceptorDefinition;
  children: ReactNode;
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
            interceptorWorker = await createApiInterceptorWorker(interceptor);
            interceptorWorker.start({
              onUnhandledRequest: "bypass",
              waitUntilReady: true,
              quiet: true,
              serviceWorker: {
                url: process.env.VITE_MOCK_WORKER_LOCATION || "/mockServiceWorker.js",
              }
            });
          }
        }
        setInitialized(true);
      })();
      return () => {
        interceptorWorker?.stop();
      };
    }
  }, [interceptor]);

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
