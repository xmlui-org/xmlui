import { useXmluiAppContext } from "../runtime/appContext";

const noop = () => {};

export function useAppContext(): {
  appGlobals: Record<string, any>;
  xmluiConfig: Record<string, any>;
  navigate: (...args: any[]) => void;
  forceRefreshAnchorScroll: () => void;
  mediaSize?: { sizeIndex: number };
} {
  const appContext = useXmluiAppContext();
  return {
    ...appContext,
    appGlobals: appContext.appGlobals as Record<string, any>,
    xmluiConfig: {},
    navigate: noop,
    forceRefreshAnchorScroll: noop,
  };
}
