import React, { ReactNode } from "react";
import { BrowserRouter, HashRouter, MemoryRouter } from "react-router-dom";
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
import { ThemeTone } from "../../abstractions/ThemingDefs";
import { LoggerProvider } from "../../logging/LoggerContext";
import { LoggerInitializer } from "../../logging/LoggerInitializer";

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
  trackContainerHeight?: boolean;

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

  children?: ReactNode;
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
            <InspectorProvider sources={sources}>
              <ConfirmationModalContextProvider>
                <AppContent
                  rootContainer={node as ContainerWrapperDef}
                  routerBaseName={baseName}
                  globalProps={globalProps}
                  standalone={standalone}
                  decorateComponentsWithTestId={decorateComponentsWithTestId}
                  debugEnabled={debugEnabled}
                >
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
  const Router = previewMode ? MemoryRouter : useHashBasedRouting ? HashRouter : BrowserRouter;

  return (
    // <React.StrictMode>
    <ErrorBoundary node={node} location={"root-outer"}>
      <QueryClientProvider client={queryClient}>
        {/* No router in the REMIX environment */}
        {(typeof window === "undefined" || process.env.VITE_REMIX) && dynamicChildren}

        {/* Wrap the app in a router in other cases */}
        {!(typeof window === "undefined" || process.env.VITE_REMIX) && (
          <Router basename={Router === HashRouter ? undefined : baseName}>{dynamicChildren}</Router>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
    // </React.StrictMode>
  );
};
