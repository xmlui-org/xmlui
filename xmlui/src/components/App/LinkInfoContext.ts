import { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { NavHierarchyNode } from "../NavPanel/NavPanelReact";

export interface ILinkInfoContext {
  linkMap?: Map<string, NavHierarchyNode>;
  registerLinkMap?: (linkMap: Map<string, NavHierarchyNode>) => void;
}

export const LinkInfoContext = createContext<ILinkInfoContext | null>(null);

export function useLinkInfoContext() {
  return useContext(LinkInfoContext);
}

export function useLinkInfo(): NavHierarchyNode | undefined {
  const linkInfoContext = useLinkInfoContext();
  const location = useLocation();
  return useMemo(() => {
    return linkInfoContext?.linkMap?.get(location.pathname);
  }, [linkInfoContext?.linkMap, location.pathname]);
}
