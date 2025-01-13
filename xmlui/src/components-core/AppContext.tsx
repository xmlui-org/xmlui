import { createContext, useContext } from "react";

import type { AppContextObject } from "@abstractions/AppContextDefs";

/**
 * Stores the object that holds the global functions and methods of xmlui.
 */
export const AppContext = createContext<AppContextObject | undefined>(undefined);

/**
 * This React hook makes the current context of application services available
 * within any component logic using the hook.
 */
export function useAppContext () {
  return useContext(AppContext)!;
}
