import { createContext, useContext, type ReactNode } from "react";

type AppShellContextValue = {
  showDrawerToggle: boolean;
  toggleDrawer?: () => void;
  inlineNavPanel?: ReactNode;
};

const AppShellContext = createContext<AppShellContextValue>({ showDrawerToggle: false });

export function AppShellProvider({
  children,
  inlineNavPanel,
  showDrawerToggle,
  toggleDrawer,
}: {
  children: ReactNode;
  inlineNavPanel?: ReactNode;
  showDrawerToggle: boolean;
  toggleDrawer?: () => void;
}) {
  return (
    <AppShellContext.Provider value={{ inlineNavPanel, showDrawerToggle, toggleDrawer }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShellContext(): AppShellContextValue {
  return useContext(AppShellContext);
}
