import { createContext, useContext, type ReactNode } from "react";

export const appLayouts = [
  "vertical",
  "vertical-sticky",
  "vertical-full-header",
  "condensed",
  "condensed-sticky",
  "horizontal",
  "horizontal-sticky",
  "desktop",
] as const;

export type AppLayoutType = (typeof appLayouts)[number];

export interface IAppLayoutContext {
  layout: AppLayoutType;
  navPanelVisible: boolean;
  navPanelCollapsed: boolean;
  setNavPanelCollapsed: (collapsed: boolean) => void;
  toggleNavPanelCollapsed: () => void;
  drawerVisible: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
  toggleDrawer: () => void;
  hasRegisteredNavPanel: boolean;
  hasRegisteredHeader: boolean;
  navPanelDef?: unknown;
  logoContentDef?: ReactNode;
  logo?: string;
  logoDark?: string;
  logoLight?: string;
  registerSubNavPanelSlot?: (slot: HTMLElement | null) => void;
  subNavPanelSlot?: HTMLElement | null;
  scrollWholePage?: boolean;
  isNarrowScreen?: boolean;
  isFullVerticalWidth?: boolean;
  isNested?: boolean;
  setScrollRestorationEnabled?: (enabled: boolean) => void;
}

export const AppLayoutContext = createContext<IAppLayoutContext | null>(null);

export function useAppLayoutContext() {
  return useContext(AppLayoutContext);
}
