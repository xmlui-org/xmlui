import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type RegisteredTab = {
  activated?: () => void;
  content: ReactNode;
  header?: ReactNode;
  id?: string;
  index: number;
  innerId: string;
  label: string;
};

export type TabsContextValue = {
  activeId: string | undefined;
  keepMounted: boolean;
  register(tab: RegisteredTab): void;
  unregister(innerId: string): void;
};

export const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export function useTabsContext(): TabsContextValue | undefined {
  return useContext(TabsContext);
}
