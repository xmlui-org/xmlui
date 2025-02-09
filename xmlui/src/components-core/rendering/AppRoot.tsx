import { useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { enableMapSet } from "immer";

import type { ComponentDef, ComponentLike } from "../../abstractions/ComponentDefs";
import { resetErrors } from "../reportEngineError";
import { ComponentProvider } from "../../components/ComponentProvider";
import { DebugViewProvider } from "../DebugViewProvider";
import { AppWrapper, AppWrapperProps } from "./AppWrapper";
import StandaloneExtensionManager from "../StandaloneExtensionManager";

// --- We want to enable the produce method of `immer` on Map objects
enableMapSet();

// --- This type represents an arbitrary set of global properties (name
// --- and value pairs).
export type GlobalProps = Record<string, any>;

// --- We use this object in the app context to represent the `QlientQuery`
// --- of the react-query package.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * This component is responsible for running a pre-compiled xmlui app. It 
 * receives the internal representation of the app markup and code (coming 
 * from either code-behind files or inlined markup expressions) and executes 
 * the app accordingly.
 */
export function AppRoot({
  apiInterceptor,
  contributes,
  node,
  decorateComponentsWithTestId,
  debugEnabled,
  defaultTheme,
  defaultTone,
  resources,
  globalProps,
  standalone,
  trackContainerHeight,
  routerBaseName,
  previewMode,
  resourceMap,
  sources,
  extensionManager,
}: AppWrapperProps & { extensionManager?: StandaloneExtensionManager }) {
  // --- Make sure, the root node is wrapped in a `Theme` component. Also, 
  // --- the root node must be wrapped in a `Container` component managing 
  // --- the app's top-level state.
  const rootNode = useMemo(() => {
    const themedRoot =
      (node as ComponentDef).type === "Theme"
        ? {
            ...node,
            props: {
              ...(node as ComponentDef).props,
              root: true,
            },
          }
        : {
            type: "Theme",
            props: {
              root: true,
            },
            children: [node],
          };
    return {
      type: "Container",
      uid: "root",
      children: [themedRoot],
      uses: [],
    };
  }, [node]);

  // --- Start with an error-free state
  resetErrors();

  // --- Render the app providing a component registry (in which the engine finds a 
  // --- component definition by its name). Ensure the app has a context for debugging.
  return (
    <ComponentProvider contributes={contributes} extensionManager={extensionManager}>
      <DebugViewProvider debugConfig={globalProps?.debug}>
        <AppWrapper
          resourceMap={resourceMap}
          apiInterceptor={apiInterceptor}
          node={rootNode as ComponentLike}
          contributes={contributes}
          resources={resources}
          routerBaseName={routerBaseName}
          decorateComponentsWithTestId={decorateComponentsWithTestId}
          debugEnabled={debugEnabled}
          defaultTheme={defaultTheme}
          defaultTone={defaultTone}
          globalProps={globalProps}
          standalone={standalone}
          trackContainerHeight={trackContainerHeight}
          previewMode={previewMode}
          sources={sources}
        />
      </DebugViewProvider>
    </ComponentProvider>
  );
}
