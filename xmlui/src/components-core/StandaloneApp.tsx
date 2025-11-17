import type { ReactNode } from "react";
import { useMemo } from "react";

import type { StandaloneAppDescription } from "./abstractions/standalone";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

import "../index.scss";
import { AppRoot } from "./rendering/AppRoot";
import { ApiInterceptorProvider } from "./interception/ApiInterceptorProvider";
import StandaloneExtensionManager from "./StandaloneExtensionManager";
import type { ThemeTone } from "../abstractions/ThemingDefs";
import { useStandalone } from "./useStandalone";
import { usePrintVersionNumber } from "./utils/hooks";
import type { Root } from "react-dom/client";
import type { Extension } from "../abstractions/ExtensionDefs";
import ReactDOM from "react-dom/client";

/**
 * This function injects the StandaloneApp component into a React app. It looks
 * up a component with the "root" id as the host of the standalone app. If such
 * an element does not exist, it creates a `<div id="root">` element.
 * @param runtime The app's runtime representation
 * @param components The related component's runtime representation
 * @returns The content's root element
 */

let contentRoot: Root | null = null;

export function startApp(
  runtime: any,
  extensions: Extension[] | Extension = [],
  extensionManager: StandaloneExtensionManager = new StandaloneExtensionManager(),
) {
  extensionManager.registerExtension(extensions);
  let rootElement: HTMLElement | null = document.getElementById("root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.setAttribute("id", "root");
    document.body.appendChild(rootElement);
  }
  if (!contentRoot) {
    contentRoot = ReactDOM.createRoot(rootElement);
  }
  contentRoot.render(<StandaloneApp runtime={runtime} extensionManager={extensionManager} />);
  return contentRoot;
}

type RuntimeProps = {
  default?: any;
  component?: ComponentDef | CompoundComponentDef;
  file?: string;
  src?: string;
};

// --- The properties of the standalone app
type StandaloneAppProps = {
  // --- The standalone app description (the engine renders this definition)
  appDef?: StandaloneAppDescription;
  appGlobals?: Record<string, any>;

  // --- In E2E tests, we can decorate the components with test IDs
  decorateComponentsWithTestId?: boolean;

  // --- Debugging can be enabled or disabled
  debugEnabled?: boolean;

  // --- The runtime environment of the standalone app (for pre-compiled apps)
  runtime?: RuntimeProps;

  // --- The object responsible for managing the standalone components
  extensionManager?: StandaloneExtensionManager;

  // --- If true, the app waits for the API interceptor to be ready
  waitForApiInterceptor?: boolean;
  children?: ReactNode;
};

/**
 * This React component represents a standalone app that implements a web
 * application with xmlui components. A StandaloneApp instance uses a
 * AppRoot wrapped into an ApiInterceptor.
 *
 * AppRoot is responsible for rendering the app (using an internal
 * representation); ApiInterceptor can emulate some backend functionality
 * running in the browser.
 */
function StandaloneApp({
  appDef,
  appGlobals: globals,
  decorateComponentsWithTestId,
  debugEnabled = false,
  runtime,
  extensionManager,
  waitForApiInterceptor = false,
  children,
}: StandaloneAppProps) {
  // --- Fetch all files constituting the standalone app, including components,
  // --- themes, and other artifacts. Display the app version numbers in the
  // --- console.
  const { standaloneApp, projectCompilation } = useStandalone(appDef, runtime, extensionManager);

  usePrintVersionNumber(standaloneApp);

  const { apiInterceptor, name, appGlobals, components, themes } = standaloneApp || {};

  const globalProps = useMemo(() => {
    return {
      name: name,
      ...(appGlobals || {}),
      ...(globals || {}),
    };
  }, [appGlobals, globals, name]);

  let contributes = useMemo(() => {
    return {
      compoundComponents: components,
      themes,
    };
  }, [components, themes]);

  if (!standaloneApp) {
    // --- Problems found, the standalone app cannot run
    return null;
  }

  // --- The app may use a mocked API already defined in `window.XMLUI_MOCK_API`
  // --- or within the standalone app's definition, in `apiInterceptor`.
  const mockedApi =
    // @ts-ignore
    typeof window !== "undefined" && window.XMLUI_MOCK_API ? window.XMLUI_MOCK_API : apiInterceptor;

  // --- Components can be decorated with test IDs used in end-to-end tests.
  // --- This flag checks the environment if the app runs in E2E test mode.
  const shouldDecorateWithTestId =
    decorateComponentsWithTestId ||
    // @ts-ignore
    (typeof window !== "undefined" ? window.XMLUI_MOCK_TEST_ID : false);

  // --- An app can turn off the default hash routing.
  const useHashBasedRouting = appGlobals?.useHashBasedRouting ?? true;

  return (
    <ApiInterceptorProvider
      interceptor={mockedApi}
      useHashBasedRouting={useHashBasedRouting}
      waitForApiInterceptor={waitForApiInterceptor}
    >
      <AppRoot
        node={standaloneApp.entryPoint!}
        defaultTheme={standaloneApp.defaultTheme}
        defaultTone={standaloneApp.defaultTone as ThemeTone}
        resources={standaloneApp.resources}
        resourceMap={standaloneApp.resourceMap}
        sources={standaloneApp.sources}
        projectCompilation={projectCompilation}
        decorateComponentsWithTestId={shouldDecorateWithTestId}
        standalone={true}
        debugEnabled={debugEnabled}
        // @ts-ignore
        routerBaseName={window?.__PUBLIC_PATH || ""}
        globalProps={globalProps}
        extensionManager={extensionManager}
        contributes={contributes}
      >
        {children}
      </AppRoot>
    </ApiInterceptorProvider>
  );
}

export default StandaloneApp;
