import { useXmluiAppContext } from "../runtime/appContext";

const noop = () => {};

export function useAppContext(): {
  appGlobals: Record<string, any>;
  loggedInUser: unknown;
  xmluiConfig: Record<string, any>;
  navigate: (...args: any[]) => void;
  setLoggedInUser: (user: unknown) => void;
  setNavigationHandlers: (handlers: unknown) => void;
  forceRefreshAnchorScroll: () => void;
  mediaSize: {
    sizeIndex: number;
    largeScreen: boolean;
    smallScreen: boolean;
    desktop: boolean;
    phone: boolean;
    tablet: boolean;
  };
  App: Record<string, (...args: any[]) => any>;
} {
  const appContext = useXmluiAppContext();
  const sizeIndex = appContext.mediaSize?.sizeIndex ?? 4;
  return {
    ...appContext,
    appGlobals: appContext.appGlobals as Record<string, any>,
    loggedInUser: appContext.loggedInUser,
    xmluiConfig: {},
    navigate: noop,
    setLoggedInUser: appContext.setLoggedInUser,
    setNavigationHandlers: noop,
    forceRefreshAnchorScroll: noop,
    mediaSize: {
      sizeIndex,
      largeScreen: sizeIndex >= 3,
      smallScreen: sizeIndex < 3,
      desktop: sizeIndex >= 3,
      phone: sizeIndex <= 1,
      tablet: sizeIndex === 2,
    },
    App: {
      setLocale: noop,
      registerLocaleBundles: noop,
      setAuditPolicy: noop,
      setAppDirection: noop,
      isRtlLocale: () => false,
      setScheduler: noop,
    },
  };
}
