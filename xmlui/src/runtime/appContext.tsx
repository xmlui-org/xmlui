import React, { createContext, type ReactNode, useContext } from "react";

export type XmluiAppContextValue = {
  appGlobals: Record<string, unknown>;
  xmluiConfig: Record<string, unknown>;
  loggedInUser: unknown;
  setLoggedInUser: (user: unknown) => void;
  confirm: (
    title?: unknown,
    message?: unknown,
    okLabel?: unknown,
    cancelLabel?: unknown,
    width?: unknown,
  ) => Promise<boolean>;
  signError: (error: unknown) => void;
  mediaSize: {
    sizeIndex: number;
    size: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
    phone: boolean;
    landscapePhone: boolean;
    tablet: boolean;
    desktop: boolean;
    largeDesktop: boolean;
    xlDesktop: boolean;
    smallScreen: boolean;
    largeScreen: boolean;
  };
};

const defaultAppContext: XmluiAppContextValue = {
  appGlobals: {},
  xmluiConfig: {},
  loggedInUser: undefined,
  setLoggedInUser: () => {},
  confirm: () => Promise.resolve(false),
  signError: () => {},
  mediaSize: {
    size: "xl",
    sizeIndex: 4,
    phone: false,
    landscapePhone: false,
    tablet: false,
    desktop: false,
    largeDesktop: true,
    xlDesktop: false,
    smallScreen: false,
    largeScreen: true,
  },
};

const XmluiAppContext = createContext<XmluiAppContextValue>(defaultAppContext);

export function XmluiAppContextProvider({
  value,
  children,
}: {
  value: XmluiAppContextValue;
  children?: ReactNode;
}) {
  return (
    <XmluiAppContext.Provider value={value}>
      {children}
    </XmluiAppContext.Provider>
  );
}

export function useXmluiAppContext(): XmluiAppContextValue {
  return useContext(XmluiAppContext);
}
