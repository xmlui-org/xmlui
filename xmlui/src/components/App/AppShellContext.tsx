import { createContext, useContext, type ReactNode } from "react";

type AppShellContextValue = {
  showDrawerToggle: boolean;
  toggleDrawer?: () => void;
};

const AppShellContext = createContext<AppShellContextValue>({ showDrawerToggle: false });

export function AppShellProvider({
  children,
  showDrawerToggle,
  toggleDrawer,
}: {
  children: ReactNode;
  showDrawerToggle: boolean;
  toggleDrawer?: () => void;
}) {
  return (
    <AppShellContext.Provider value={{ showDrawerToggle, toggleDrawer }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShellContext(): AppShellContextValue {
  return useContext(AppShellContext);
}
