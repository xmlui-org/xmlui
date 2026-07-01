import { createContext, useContext, type ReactNode } from "react";

export type NavGroupContextValue = {
  level: number;
  forceVerticalItems?: boolean;
  iconHorizontalCollapsed: string;
  iconHorizontalExpanded: string;
  iconVerticalCollapsed: string;
  iconVerticalExpanded: string;
};

export const NavGroupContext = createContext<NavGroupContextValue>({
  level: -1,
  forceVerticalItems: false,
  iconHorizontalCollapsed: "chevronright",
  iconHorizontalExpanded: "chevronright",
  iconVerticalCollapsed: "chevronright",
  iconVerticalExpanded: "chevrondown",
});

export function NavGroupItemProvider({ children }: { children: ReactNode }) {
  const context = useContext(NavGroupContext);
  return (
    <NavGroupContext.Provider value={context}>
      {children}
    </NavGroupContext.Provider>
  );
}

export function useIsNavGroupItem(): boolean {
  return useContext(NavGroupContext).level >= 0;
}

export function useNavGroupContext(): NavGroupContextValue {
  return useContext(NavGroupContext);
}
