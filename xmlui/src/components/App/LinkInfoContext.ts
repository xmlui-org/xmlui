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
    const linkMap = linkInfoContext?.linkMap;
    if (!linkMap) {
      return undefined;
    }
    const hashPath = location.hash.startsWith("#/") ? location.hash.slice(1) : undefined;
    return (
      linkMap.get(location.pathname) ??
      (hashPath ? linkMap.get(hashPath) : undefined) ??
      linkMap.get(`${location.pathname}${location.search}`)
    );
  }, [linkInfoContext?.linkMap, location.hash, location.pathname, location.search]);
}
