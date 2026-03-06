import { createContext, useContext, useMemo, type ReactNode } from "react";

export type SsgEnv = Record<string, unknown>;

type SsgEnvContextValue = {
  ssgEnv?: SsgEnv;
};

const SsgEnvContext = createContext<SsgEnvContextValue>({});

function readSsgEnvFromRoot(): SsgEnv | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const root = document.getElementById("root");
  if (!root?.hasAttribute("data-xmlui-ssg")) {
    return undefined;
  }

  return {};
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
