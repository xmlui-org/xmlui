import React, { createContext, type ReactNode, useContext } from "react";

export type XmluiAppContextValue = {
  appGlobals: Record<string, unknown>;
  mediaSize: {
    sizeIndex: number;
  };
};

const defaultAppContext: XmluiAppContextValue = {
  appGlobals: {},
  mediaSize: { sizeIndex: 4 },
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
