import { createContext, useContext } from "react";
import type { NavHierarchyNode } from "../NavPanel/NavPanelNative";

export interface ILinkInfoContext {
  linkMap?: Map<string, NavHierarchyNode>;
  registerLinkMap?: (linkMap: Map<string, NavHierarchyNode>) => void;
}

export const LinkInfoContext = createContext<ILinkInfoContext | null>(null);

export function useLinkInfoContext() {
  return useContext(LinkInfoContext);
}
