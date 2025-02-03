import { useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { enableMapSet } from "immer";

import type { ComponentDef, ComponentLike } from "@abstractions/ComponentDefs";
import { resetErrors } from "@components-core/reportEngineError";
import { ComponentProvider } from "@components/ComponentProvider";
import { DebugViewProvider } from "../DebugViewProvider";
import { AppWrapper, AppWrapperProps } from "./AppWrapper";
import StandaloneExtensionManager from "@components-core/StandaloneExtensionManager";

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
 * This component runs the app in the context of the registered components
 * (including the core xmlui components and external ones passed to this
 * component.
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
  servedFromSingleFile,
  resourceMap,
  sources,
  extensionManager,
}: AppWrapperProps & { extensionManager?: StandaloneExtensionManager }) {
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

  resetErrors();

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
          servedFromSingleFile={servedFromSingleFile}
          sources={sources}
        />
      </DebugViewProvider>
    </ComponentProvider>
  );
}

export default AppRoot;
