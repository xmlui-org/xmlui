import { createContext, useContext, type ReactNode } from "react";

type AppShellContextValue = {
  showDrawerToggle: boolean;
};

const AppShellContext = createContext<AppShellContextValue>({ showDrawerToggle: false });

export function AppShellProvider({
  children,
  showDrawerToggle,
}: {
  children: ReactNode;
  showDrawerToggle: boolean;
}) {
  return (
    <AppShellContext.Provider value={{ showDrawerToggle }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShellContext(): AppShellContextValue {
  return useContext(AppShellContext);
}
