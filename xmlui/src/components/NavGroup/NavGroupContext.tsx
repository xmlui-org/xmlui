import { createContext, useContext, type ReactNode } from "react";

const NavGroupItemContext = createContext(false);

export function NavGroupItemProvider({ children }: { children: ReactNode }) {
  return <NavGroupItemContext.Provider value={true}>{children}</NavGroupItemContext.Provider>;
}

export function useIsNavGroupItem(): boolean {
  return useContext(NavGroupItemContext);
}
