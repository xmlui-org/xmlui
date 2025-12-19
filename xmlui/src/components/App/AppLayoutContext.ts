import { createContext, useContext } from "react";

import type { ComponentDef, PropertyValueDescription } from "../../abstractions/ComponentDefs";

const appLayoutNames = [
  "vertical",
  "vertical-sticky",
  "vertical-full-header",
  "condensed",
  "condensed-sticky",
  "horizontal",
  "horizontal-sticky",
  "desktop",
] as const;
export const appLayoutMd: readonly PropertyValueDescription[] = [
  {
    value: "vertical",
    description:
      "This layout puts the navigation bar on the left side and displays its items vertically. The main content is aligned to the right (including the header and the footer), and its content is a single scroll container; every part of it moves as you scroll the page. This layout does not display the logo in the app header.",
  },
  {
    value: "vertical-sticky",
    description:
      "Similar to `vertical`, the header and the navigation bar dock to the top of the main content's viewport, while the footer sticks to the bottom. This layout does not display the logo in the app header.",
  },
  {
    value: "vertical-full-header",
    description:
      "Similar to `vertical-sticky`. However, the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom.",
  },
  {
    value: "condensed",
    description:
      "Similar to `horizontal`. However, the header and the navigation bar are in a single header block. (default)",
  },
  {
    value: "condensed-sticky",
    description: "However, the header and the navigation bar are in a single header block.",
  },
  {
    value: "horizontal",
    description:
      "This layout stacks the layout sections in a single column in this order: header, navigation bar, main content, and footer. The application is a single scroll container; every part moves as you scroll the page.",
  },
  {
    value: "horizontal-sticky",
    description:
      "Similar to `horizontal`, the header and the navigation bar dock to the top of the viewport, while the footer sticks to the bottom.",
  },
  {
    value: "desktop",
    description:
      "This layout stretches the app to fill the entire browser viewport with zero padding and margins. The header (if present) docks to the top, the footer (if present) docks to the bottom, and the main content stretches to fill the remaining vertical and horizontal space.",
  },
] as const;

export const appLayouts: string[] = [...appLayoutNames];
export type AppLayoutType = (typeof appLayoutNames)[number];

export interface IAppLayoutContext {
  layout: AppLayoutType;
  navPanelVisible: boolean;
  drawerVisible: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
  toggleDrawer: () => void;
  hasRegisteredNavPanel: boolean;
  hasRegisteredHeader: boolean;
  navPanelDef?: ComponentDef;
  logoContentDef?: ComponentDef;
  logo?: string;
  logoDark?: string;
  logoLight?: string;
  registerSubNavPanelSlot?: (slot: HTMLElement) => void;
  subNavPanelSlot?: HTMLElement;
  scrollWholePage?: boolean;
  isFullVerticalWidth?: boolean;
  isNested?: boolean;
  setScrollRestorationEnabled?: (enabled: boolean) => void;
}

export const AppLayoutContext = createContext<IAppLayoutContext | null>(null);

export function useAppLayoutContext() {
  return useContext(AppLayoutContext);
}
