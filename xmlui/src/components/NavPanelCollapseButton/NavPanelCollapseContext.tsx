import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

export type NavPanelCollapseContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const NavPanelCollapseContext = createContext<NavPanelCollapseContextValue | null>(null);

export function NavPanelCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const value = useMemo<NavPanelCollapseContextValue>(() => ({
    collapsed,
    toggle: () => setCollapsed((current) => !current),
  }), [collapsed]);

  return (
    <NavPanelCollapseContext.Provider value={value}>
      {children}
    </NavPanelCollapseContext.Provider>
  );
}

export function useNavPanelCollapseContext(): NavPanelCollapseContextValue | null {
  return useContext(NavPanelCollapseContext);
}
