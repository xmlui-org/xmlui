import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SetupWorker } from "msw/browser";

import type { IApiInterceptorContext } from "../../abstractions/AppContextDefs";
import type { ApiInterceptorDefinition } from "../interception/abstractions";
import { normalizePath } from "../utils/misc";
import { ApiInterceptorContext } from "./useApiInterceptorContext";
import type { ApiInterceptor } from "./ApiInterceptor";

type Props = {
  interceptor?: ApiInterceptorDefinition;
  children: ReactNode;
  parentInterceptorContext?: IApiInterceptorContext;
  waitForApiInterceptor?: boolean;
  useHashBasedRouting?: boolean;
}

// This React component injects the API interceptor into the application's context
export function ApiInterceptorProvider({
  interceptor,
  children,
  parentInterceptorContext = null,
  waitForApiInterceptor = false,
}: Props) {
  const hasParentInterceptorContext = parentInterceptorContext !== null;
  const [initialized, setInitialized] = useState(!interceptor);
  const [forceInitialize, setForceInitialize] = useState(false);
  const [interceptorWorker, setInterceptorWorker] = useState<SetupWorker | null>(null);
  const [apiInstance, setApiInstance] = useState<ApiInterceptor | null>(null);

  const useWorker = interceptor?.useWorker ?? true;

  // --- Whenever the interceptor changes, update the provider accordingly
  let forceInitializeParent = parentInterceptorContext?.forceInitialize;
  let parentInterceptorWorker = parentInterceptorContext?.interceptorWorker;



  //// if we don't use a worker, we initialize the api instance directly
  useEffect(()=>{
    if(useWorker){
      return;
    }
    if (!interceptor) {
      return;
    }

    (async () => {
      const { initMock } = await import("./initMock");
      const apiInstance = await initMock(interceptor);
      setApiInstance(apiInstance);
      setInitialized(true);
    })();
  }, [interceptor, useWorker]);

  //// if we use a worker, we initialize the worker with the api instance
  useEffect(() => {
    if(!useWorker){
      return;
    }
    if (!hasParentInterceptorContext) {
      if (interceptor || forceInitialize) {
        // setInitialized(false);

        // --- We use "msw" to manage the API interception
        let interceptorWorker: SetupWorker;
        (async () => {
          // --- Create the worker on the fly
          if (process.env.VITE_MOCK_ENABLED) {
            const [{ createApiInterceptorWorker }, { initMock }] = await Promise.all([
              useWorker
                ? import("./apiInterceptorWorker")
                : Promise.resolve({ createApiInterceptorWorker: () => null }),
              import("./initMock"),
            ]);

            if (interceptor || forceInitialize) {
              const apiInstance = await initMock(interceptor || {});
              interceptorWorker = await createApiInterceptorWorker(apiInstance);
              // if the apiWorker comes from the outside, we don't handle the lifecycle here
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
              setInterceptorWorker(interceptorWorker);
            }
          }
          setInitialized(true);
        })();
        return () => {
          // if the apiWorker comes from the outside, we don't handle the lifecycle here
          if (!parentInterceptorWorker) {
            interceptorWorker?.stop();
          }
          setInitialized(false);
        };
      } else {
        setInitialized(true);
      }
    } else {
      if (!interceptor) {
        return;
      }
      if (parentInterceptorWorker) {
        (async () => {
          const [{ createApiInterceptorWorker }, { initMock }] = await Promise.all([
            import("./apiInterceptorWorker"),
            import("./initMock"),
          ]);
          const apiInstance = await initMock(interceptor);
          await createApiInterceptorWorker(apiInstance, parentInterceptorWorker);
          setTimeout(() => {
            setInitialized(true);
          }, 0);
        })();
      } else {
        forceInitializeParent?.();
      }
    }
  }, [
    useWorker,
    forceInitialize,
    hasParentInterceptorContext,
    interceptor,
    forceInitializeParent,
    parentInterceptorWorker,
  ]);

  const isMocked = useCallback(
    (url) => interceptor !== undefined && !!process.env.VITE_MOCK_ENABLED,
    [interceptor],
  );

  const doForceInitialize = useCallback(() => {
    setForceInitialize(true);
  }, []);

  const contextValue: IApiInterceptorContext = useMemo(() => {
    return {
      interceptorWorker,
      apiInstance,
      initialized: initialized,
      forceInitialize: doForceInitialize,
      isMocked: isMocked,
    };
  }, [interceptorWorker, apiInstance, initialized, doForceInitialize, isMocked]);

  return (
    <ApiInterceptorContext.Provider value={contextValue}>
      {waitForApiInterceptor && !initialized ? null : children}
    </ApiInterceptorContext.Provider>
  );
}
