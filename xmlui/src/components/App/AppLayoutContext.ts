import { createContext, useContext } from "react";

const appLayoutNames = [
  "vertical",
  "vertical-sticky",
  "vertical-full-header",
  "condensed",
  "condensed-sticky",
  "horizontal",
  "horizontal-sticky",
] as const;

export const appLayouts: string[] = [...appLayoutNames];
export type AppLayoutType = typeof appLayoutNames[number];

interface IAppLayoutContext {
  layout: AppLayoutType;
  navPanelVisible: boolean;
  drawerVisible: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
  toggleDrawer: () => void;
  navPanelRoot: HTMLElement | null;
  drawerRoot: HTMLElement | null;
  headerRoot: HTMLElement | null;
  footerRoot: HTMLElement | null;
  hasRegisteredNavPanel: boolean;
  hasRegisteredHeader: boolean;
  setNavPanelRoot: (element: HTMLElement | null) => void;
  registerHeader: (id: string) => void;
  unregisterHeader: (id: string) => void;
  registerNavPanel: (id: string) => void;
  unregisterNavPanel: (id: string) => void;
}

export const AppLayoutContext = createContext<IAppLayoutContext | null>(null);

export function useAppLayoutContext() {
  return useContext(AppLayoutContext);
}
