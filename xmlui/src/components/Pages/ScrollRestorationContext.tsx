import { createContext, useContext } from "react";

export interface ScrollRestorationContextValue {
  restoreScrollOnBack: boolean;
}

const defaultValue: ScrollRestorationContextValue = {
  restoreScrollOnBack: false,
};

export const ScrollRestorationContext =
  createContext<ScrollRestorationContextValue>(defaultValue);

export function useScrollRestoration() {
  return useContext(ScrollRestorationContext);
}

