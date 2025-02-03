import { ComponentLike } from "@abstractions/ComponentDefs";
import { ContributesDefinition } from "@components/ComponentProvider";
import { GlobalProps, queryClient } from "./AppRoot";
import { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import { ThemeTone } from "@components-core/theming/abstractions";
import { EMPTY_OBJECT } from "@components-core/constants";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { IconProvider } from "@components/IconProvider";
import ThemeProvider from "@components-core/theming/ThemeProvider";
import { InspectorProvider } from "@components-core/InspectorContext";
import { ConfirmationModalContextProvider } from "@components/ModalDialog/ConfirmationModalContextProvider";
import { AppContent } from "./AppContent";
import { ContainerComponentDef } from "./ContainerComponent";
import { BrowserRouter, HashRouter, MemoryRouter } from "react-router-dom";
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";

export type AppWrapperProps = {
  // --- The root node of the application definition; the internal
  // --- representation of the entire app to run
  node: ComponentLike;

  // --- If set to `true`, the app is displayed in preview mode (uses
  // --- different routing and changes some aspects of browser integration).
  previewMode?: boolean;

  // --- (seems obsolete) Indicates if the app is served from a single `index.html` file.
  servedFromSingleFile?: boolean;

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
};

/**
 * This React component is intended to be the root component in a browser window. It handles the application state
 * changes, routing, and theming, provides an error boundary, and handles a few other aspects.
 */
export const AppWrapper = ({
  node,
  previewMode = false,
  servedFromSingleFile = false,
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
}: AppWrapperProps) => {
  if (previewMode) {
    //to prevent leaking the meta items to the parent document, if it lives in an iframe (e.g. docs)
    HelmetProvider.canUseDOM = false;
  }

  const siteName = globalProps?.name || "XMLUI app";
  const useHashBasedRouting = globalProps?.useHashBasedRouting ?? true;

  const dynamicChildren = (
    <HelmetProvider>
      <Helmet defaultTitle={siteName} titleTemplate={`%s | ${siteName}`} />
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
                rootContainer={node as ContainerComponentDef}
                routerBaseName={baseName}
                globalProps={globalProps}
                standalone={standalone}
                trackContainerHeight={trackContainerHeight}
                decorateComponentsWithTestId={decorateComponentsWithTestId}
                debugEnabled={debugEnabled}
              />
            </ConfirmationModalContextProvider>
          </InspectorProvider>
        </ThemeProvider>
      </IconProvider>
    </HelmetProvider>
  );

  const Router = previewMode
    ? MemoryRouter
    : servedFromSingleFile || useHashBasedRouting
      ? HashRouter
      : BrowserRouter;

  return (
    <React.StrictMode>
      <ErrorBoundary node={node} location={"root-outer"}>
        <QueryClientProvider client={queryClient}>
          {(typeof window === "undefined" || process.env.VITE_REMIX) && dynamicChildren}
          {!(typeof window === "undefined" || process.env.VITE_REMIX) && (
            <Router basename={Router === HashRouter ? undefined : baseName}>
              {dynamicChildren}
            </Router>
          )}
          {/*<ReactQueryDevtools initialIsOpen={true} />*/}
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};
