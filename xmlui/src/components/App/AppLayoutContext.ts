import { createContext, useContext } from "react";
import {ComponentDef} from "@abstractions/ComponentDefs";

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

export interface IAppLayoutContext {
  layout: AppLayoutType;
  navPanelVisible: boolean;
  drawerVisible: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
  toggleDrawer: () => void;
  hasRegisteredNavPanel: boolean;
  hasRegisteredHeader: boolean;
  navPanelDef?: ComponentDef
}

export const AppLayoutContext = createContext<IAppLayoutContext | null>(null);

export function useAppLayoutContext() {
  return useContext(AppLayoutContext);
}
