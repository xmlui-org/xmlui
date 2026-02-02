import type { ReactNode } from "react";
import { BrowserRouter, HashRouter, MemoryRouter, useInRouterContext } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Helmet, HelmetProvider } from "react-helmet-async";

import type { ComponentLike } from "../../abstractions/ComponentDefs";
import type { ContributesDefinition } from "../../components/ComponentProvider";
import { ConfirmationModalContextProvider } from "../../components/ModalDialog/ConfirmationModalContextProvider";
import type { ApiInterceptorDefinition } from "../interception/abstractions";
import { EMPTY_OBJECT } from "../constants";
import { IconProvider } from "../../components/IconProvider";
import ThemeProvider from "../theming/ThemeProvider";
import { InspectorProvider } from "../InspectorContext";
import type { GlobalProps } from "./AppRoot";
import { queryClient } from "./AppRoot";
import { AppContent } from "./AppContent";
import type { ContainerWrapperDef } from "./ContainerWrapper";
import { ErrorBoundary } from "./ErrorBoundary";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { LoggerProvider } from "../../logging/LoggerContext";
import { LoggerInitializer } from "../../logging/LoggerInitializer";
import type { ProjectCompilation } from "../../abstractions/scripting/Compilation";
import { ComponentViewer } from "../ComponentViewer";

export type TrackContainerHeight = "auto" | "fixed";
export type AppWrapperProps = {
  // --- The root node of the application definition; the internal
  // --- representation of the entire app to run
  node: ComponentLike;

  // --- If set to `true`, the app is displayed in preview mode (uses
  // --- different routing and changes some aspects of browser integration).
  previewMode?: boolean;

  // --- The name used as the base name in the router definition
  routerBaseName?: string;

  // --- Apps can provide their custom (third-party) components, themes,
  // --- resources (and, in the future, other artifacts) used in the
  // --- application code and markup. This property contains these artifacts.
  contributes?: ContributesDefinition;

  // --- Apps can define global configuration values (connection strings,
  // --- titles, names, etc.) used within the app through the `appGlobals`
  // --- property. This property contains the values to pass to `appGlobals`.
  globalProps?: GlobalProps;

  // --- Apps may use external resources (images, text files, icons, etc.).
  // --- This property contains the dictionary of these resources.
  resources?: Record<string, string>;

  // --- This property indicates that the xmlui app runs in a standalone app.
  // --- Its value can be queried in the app code via the `standalone` global
  // --- property.
  standalone?: boolean;

  // --- This property indicates whether the app should track the height of
  // --- the app container. We created this property for the preview component
  // --- used in the documentation platform. It has no other use.
  trackContainerHeight?: TrackContainerHeight;

  // --- This property signs that we use the app in the end-to-end test
  // --- environment. Components should use their IDs as test IDs added to the
  // --- rendered DOM so that test cases can refer to the particular DOM elements.
  decorateComponentsWithTestId?: boolean;

  // --- This property signs that app rendering runs in debug mode. Components
  // --- may display additional information in the browser's console when this
  // --- property is set.
  debugEnabled?: boolean;

  // --- If the app has an emulated API, this property contains the
  // --- corresponding API endpoint descriptions.
  apiInterceptor?: ApiInterceptorDefinition;

  // --- The ID of the default theme to use when the app starts.
  defaultTheme?: string;

  // --- The default tone to use when the app starts ("light" or "dark").
  defaultTone?: ThemeTone;

  // --- The app can map resource names to URIs used to access a particular
  // --- resource. This dictionary contains these mappings.
  resourceMap?: Record<string, string>;

  // --- An app can display the source code for learning (and debugging)
  // --- purposes. This property is a dictionary of filename and file content
  // --- pairs.
  sources?: Record<string, string>;

  projectCompilation?: ProjectCompilation;

  children?: ReactNode;

  onInit?: () => void;
};

/**
 * This component wraps the application into other layers of (nested) components
 * that provide app functionality and services requiring unique interaction with
 * the browser or the React environment.
 */
export const AppWrapper = ({
  node,
  previewMode = false,
  routerBaseName: baseName = "",
  contributes = EMPTY_OBJECT,
  globalProps,
  standalone,
  trackContainerHeight,
  decorateComponentsWithTestId,
  debugEnabled,
  defaultTheme,
  defaultTone,
  resources,
  resourceMap,
  sources,
  children,
  projectCompilation,
  onInit,
}: AppWrapperProps) => {
  if (previewMode) {
    // --- Prevent leaking the meta items to the parent document,
    // --- if it lives in an iframe (e.g. docs)
    HelmetProvider.canUseDOM = false;
  }

  // --- Set a few default properties
  const siteName = globalProps?.name || "XMLUI app";
  const useHashBasedRouting = globalProps?.useHashBasedRouting ?? true;

  // --- The children of the AppWrapper component are the components that
  // --- provide the app functionality and services. These components are
  // --- wrapped in other components that provide the necessary environment
  // --- for the app to run.
  const dynamicChildren = (
    <HelmetProvider>
      <Helmet defaultTitle={siteName} titleTemplate={`%s | ${siteName}`} />
      <LoggerProvider>
        <LoggerInitializer />
        <IconProvider>
          <ThemeProvider
            resourceMap={resourceMap}
            themes={contributes.themes}
            defaultTheme={defaultTheme}
            defaultTone={defaultTone}
            resources={resources}
          >
            <InspectorProvider
              sources={sources}
              projectCompilation={projectCompilation}
              mockApi={globalProps?.demoMockApi}
            >
              <ConfirmationModalContextProvider>
                <AppContent
                  onInit={onInit}
                  rootContainer={node as ContainerWrapperDef}
                  routerBaseName={baseName}
                  globalProps={globalProps}
                  standalone={standalone}
                  decorateComponentsWithTestId={decorateComponentsWithTestId}
                  debugEnabled={debugEnabled}
                  trackContainerHeight={trackContainerHeight}
                >
                  <ComponentViewer />
                  {children}
                </AppContent>
              </ConfirmationModalContextProvider>
            </InspectorProvider>
          </ThemeProvider>
        </IconProvider>
      </LoggerProvider>
    </HelmetProvider>
  );

  // --- Select the router type for the app
  let Router = previewMode ? MemoryRouter : useHashBasedRouting ? HashRouter : BrowserRouter;

  const alreadyInRouterContext = useInRouterContext();

  // --- We should create a router if we are explicitly in preview mode (isolated)
  // --- OR if we are NOT in an existing router context.
  const shouldCreateRouter = previewMode || !alreadyInRouterContext;

  // --- SSR Fallback: If we need to create a router but are on the server (no window),
  // --- BrowserRouter/HashRouter will fail. We must fallback to MemoryRouter to prevent crashes.
  if (shouldCreateRouter && typeof window === "undefined") {
    Router = MemoryRouter;
  }

  // --- Prepare router props
  const routerProps: any = {};

  if (Router === MemoryRouter && typeof window === "undefined") {
    // Server-side rendering: try to get the correct location
    // Location will be injected on the server side as well

    const serverLocation =
      globalThis?.location?.pathname + globalThis?.location?.search + globalThis?.location?.hash;
    if (serverLocation) {
      routerProps.initialEntries = [serverLocation];
    }
    // If no location found, MemoryRouter will default to "/"
  }

  return (
    <ErrorBoundary node={node} location={"root-outer"}>
      <QueryClientProvider client={queryClient}>
        {/* If we have an existing router, render children directly */}
        {!shouldCreateRouter && dynamicChildren}

        {/* Otherwise create our own router */}
        {shouldCreateRouter && (
          <Router basename={Router === HashRouter ? undefined : baseName} {...routerProps}>
            {dynamicChildren}
          </Router>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

/**
 * Attempts to get the server-side location from various sources during SSR.
 * Returns null if no location can be determined.
 */
function getServerLocation(globalProps?: GlobalProps): string | null {
  if (typeof window !== "undefined") {
    // Client-side: this function shouldn't be called, but return null
    return null;
  }

  // Check global variable that frameworks can set (e.g., in entry.server.tsx)
  if (typeof global !== "undefined" && (global as any).__XMLUI_SSR_LOCATION) {
    return (global as any).__XMLUI_SSR_LOCATION;
  }

  return null;
}
