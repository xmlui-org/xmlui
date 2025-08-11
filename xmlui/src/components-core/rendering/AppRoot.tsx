import { useEffect, useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { enableMapSet } from "immer";

import type { ComponentLike } from "../../abstractions/ComponentDefs";
import { resetErrors } from "../reportEngineError";
import { ComponentProvider } from "../../components/ComponentProvider";
import { DebugViewProvider } from "../DebugViewProvider";
import type StandaloneExtensionManager from "../StandaloneExtensionManager";
import type { AppWrapperProps } from "./AppWrapper";
import { AppWrapper } from "./AppWrapper";
import type { ComponentCompilation } from "../../abstractions/scripting/Compilation";
import { StyleProvider } from "../theming/StyleContext";

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
  children,
  projectCompilation,
  isNested = false,
  onInit,
}: AppWrapperProps & {
  extensionManager?: StandaloneExtensionManager;
  isNested?: boolean;
}) {
  // --- Make sure, the root node is wrapped in a `Theme` component. Also,
  // --- the root node must be wrapped in a `Container` component managing
  // --- the app's top-level state.
  const rootNode = useMemo(() => {
    const themedRoot = {
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

  if (projectCompilation) {
    const entryDeps = projectCompilation.entrypoint.dependencies;

    const transDeps = getTransitiveDependencies(entryDeps, projectCompilation.components);
    // console.log("projectCompilation: ", projectCompilation);
    // console.log("transitive dependencies of entrypoint: ", transDeps);
  }

  // --- Start with an error-free state
  resetErrors();

  // --- Add isNested to global props so it can be accessed throughout the app
  const enhancedGlobalProps = useMemo(() => ({
    ...globalProps,
    isNested,
  }), [globalProps, isNested]);

  // --- Render the app providing a component registry (in which the engine finds a
  // --- component definition by its name). Ensure the app has a context for debugging.
  return (
    <ComponentProvider contributes={contributes} extensionManager={extensionManager}>
      <StyleProvider>
        <DebugViewProvider debugConfig={globalProps?.debug}>
          <AppWrapper
            projectCompilation={projectCompilation}
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
            globalProps={enhancedGlobalProps}
            standalone={standalone}
            trackContainerHeight={trackContainerHeight}
            previewMode={previewMode}
            sources={sources}
            onInit={onInit}
          >
            {children}
          </AppWrapper>
        </DebugViewProvider>
      </StyleProvider>
    </ComponentProvider>
  );
}

/**
 *
 * @param directCompDepNames The direct dependencies (those are component names)
 * of the component for which the transitive dependencies will be returned
 * @param components the compilation info of all the components of the project */
function getTransitiveDependencies(
  directCompDepNames: Set<string>,
  components: ComponentCompilation[],
) {
  const allDepsByCompName: Map<string, Set<string>> = components.reduce(
    function addDepsByNameToCollection(
      collection: Map<string, Set<string>>,
      { definition: { name }, dependencies },
    ) {
      return collection.set(name, dependencies);
    },
    new Map(),
  );

  const transitiveDeps = new Set<string>();
  populateTransitiveDeps(directCompDepNames);
  return transitiveDeps;

  function populateTransitiveDeps(directCompDepNames: Set<string>) {
    if (!directCompDepNames) return;
    for (const directDep of directCompDepNames) {
      if (!transitiveDeps.has(directDep)) {
        transitiveDeps.add(directDep);
        const depsOfDirectDep = allDepsByCompName.get(directDep);
        populateTransitiveDeps(depsOfDirectDep);
      }
    }
  }
}
