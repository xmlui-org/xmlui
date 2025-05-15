import { createContext, useContext, useEffect, useMemo } from "react";

import { setupWorker, SetupWorker } from "msw/browser";

export const ApiWorkerContext = createContext<SetupWorker | null>(null);

export function useApiWorkerContext() {
  return useContext(ApiWorkerContext);
}

export const ApiWorkerContextProvider = ({ children }) => {
  const worker = useMemo(() => {
    if (typeof document !== "undefined") {
      return setupWorker();
    }
  }, []);

  useEffect(() => {
    worker?.start({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
    return () => worker?.stop();
  }, [worker]);

  return <ApiWorkerContext.Provider value={worker}>{children}</ApiWorkerContext.Provider>;
};
