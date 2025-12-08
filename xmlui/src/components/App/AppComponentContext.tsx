import { createContext, useContext } from "react";

/**
 * Context to track whether we're currently inside an App component.
 * This is used to validate that certain placeholder components (AppHeader, NavPanel, Logo, Pages, Footer)
 * are only used within an App component.
 */
interface AppComponentContextValue {
  insideApp: boolean;
}

const AppComponentContext = createContext<AppComponentContextValue>({ insideApp: false });

export const AppComponentProvider = AppComponentContext.Provider;

export function useAppComponentContext(): AppComponentContextValue {
  return useContext(AppComponentContext);
}

/**
 * Hook to ensure a component is only used within an App component.
 * Throws an error if called outside of an App component.
 */
export function useRequireAppContext(componentName: string): void {
  const { insideApp } = useAppComponentContext();
  if (!insideApp) {
    throw new Error(
      `<${componentName}> can only be used as a direct child of <App> or <App2> components. ` +
      `Please ensure <${componentName}> is placed within an <App> or <App2> component.`
    );
  }
}
