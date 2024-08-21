import { createContext, useContext } from "react";

import type { AppContextObject } from "@abstractions/AppContextDefs";

/**
 * This object provides the React context of the application services, which we pass the root component, and thus all
 * nested apps and components may use it.
 */
export const AppContext = createContext<AppContextObject | undefined>(undefined);

/**
 * This React hook makes the current context of application services available within any component logic using
 * the hook.
 */
export function useAppContext () {
  return useContext(AppContext)!;
}
