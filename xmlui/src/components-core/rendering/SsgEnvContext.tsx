import { createContext, useContext, useMemo, type ReactNode } from "react";
import { extractSsgEnvFromRoot, type SsgEnv } from "./ssgEnv";

type SsgEnvContextValue = {
  ssgEnv?: SsgEnv;
};

const SsgEnvContext = createContext<SsgEnvContextValue>({});

function readSsgEnvFromRoot(): SsgEnv | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  return extractSsgEnvFromRoot(document.getElementById("root"));
}

export function SsgEnvProvider({ children }: { children: ReactNode }) {
  const value = useMemo<SsgEnvContextValue>(() => {
    return { ssgEnv: readSsgEnvFromRoot() };
  }, []);

  return <SsgEnvContext.Provider value={value}>{children}</SsgEnvContext.Provider>;
}

export function useSsgEnv(): SsgEnv | undefined {
  return useContext(SsgEnvContext).ssgEnv;
}
