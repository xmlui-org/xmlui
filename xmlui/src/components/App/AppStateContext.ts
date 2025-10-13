import { createContext, useContextSelector } from "use-context-selector";

export interface IAppStateContext {
  appState: Record<string, any>;
  update: (id: string, patch: any)=> void;
}

export const AppStateContext = createContext<IAppStateContext>(null as unknown as IAppStateContext);

export function useAppStateContextPart<T = unknown>(selector: (value: IAppStateContext) => T) {
  return useContextSelector(AppStateContext, selector);
}
