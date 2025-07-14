import type { CSSProperties } from "react";
import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";

import { AppRoot } from "../../components-core/rendering/AppRoot";
import type { ThemeTone } from "../../abstractions/ThemingDefs";
import { errReportComponent, xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import { ApiInterceptorProvider } from "../../components-core/interception/ApiInterceptorProvider";
import { ErrorBoundary } from "../../components-core/rendering/ErrorBoundary";
import type { CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useComponentRegistry } from "../ComponentRegistryContext";
import { useIndexerContext } from "../App/IndexerContext";
import { useApiInterceptorContext } from "../../components-core/interception/useApiInterceptorContext";
import { EMPTY_ARRAY } from "../../components-core/constants";

type NestedAppProps = {
  api?: any;
  app: string;
  components?: any[];
  config?: any;
  activeTone?: ThemeTone;
  activeTheme?: string;
  height?: string | number;
  style?: CSSProperties;
  refreshVersion?: number;
};

export function LazyNestedApp(props: NestedAppProps) {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    startTransition(() => {
      setShouldRender(true);
    });
  }, []);
  if (!shouldRender) {
    return null;
  }
  return <NestedApp {...props} />;
}

export function IndexAwareNestedApp(props: NestedAppProps) {
  const { indexing } = useIndexerContext();
  if (indexing) {
    return null;
  }

  return <LazyNestedApp {...props} />;
}

export function NestedApp({
  api,
  app,
  components = EMPTY_ARRAY,
  config,
  activeTheme,
  activeTone,
  height,
  style,
  refreshVersion
}: NestedAppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef(null);
  const contentRootRef = useRef<Root | null>(null);
  const theme = useTheme();
  const toneToApply = activeTone || config?.defaultTone || theme?.activeThemeTone;
  const componentRegistry = useComponentRegistry();
  const parentInterceptorContext = useApiInterceptorContext();

  //TODO illesg: we should come up with something to make sure that nestedApps don't overwrite each other's mocked api endpoints
  //   disabled for now, as it messes up the paths of not mocked APIs (e.g. resources/{staticJsonfiles})
  //const safeId = playgroundId || nestedAppId;
  //const apiUrl = api ? `/${safeId.replaceAll(":", "")}` : '';
  const apiUrl = "";

  const mock = useMemo(() => {
    if (!api) {
      return undefined;
    }
    let apiObject = api;
    if (typeof api === "string") {
      try {
        apiObject = JSON.parse(api.replaceAll("\n", " "));
      } catch (e) {
        console.error("Failed to parse API definition", e);
        return undefined;
      }
    }
    return {
      ...apiObject,
      type: "in-memory",
      // apiUrl: apiUrl + (apiObject.apiUrl || ""),
    };
  }, [api]);

  useLayoutEffect(() => {
    if (!shadowRef.current && rootRef.current) {
      // Clone existing style and link tags
      shadowRef.current = rootRef.current.attachShadow({ mode: "open" });

      // This should run once to prepare the stylesheets
      const sheetPromises = Array.from(document.styleSheets).map(async (sheet) => {
        // Check if the owner element has the attribute you want to skip
        if (
          sheet.ownerNode &&
          sheet.ownerNode instanceof Element &&
          sheet.ownerNode.hasAttribute("data-theme-root")
        ) {
          return null; // Skip this stylesheet
        }
        // Can't access cross-origin sheets, so skip them
        if (!sheet.href || sheet.href.startsWith(window.location.origin)) {
          try {
            // Create a new CSSStyleSheet object
            const newSheet = new CSSStyleSheet();
            // Get the CSS rules as text
            const cssText = Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join(" ");
            // Apply the text to the new sheet object
            await newSheet.replace(cssText);
            return newSheet;
          } catch (e) {
            // console.error('Could not process stylesheet:', sheet.href, e);
            return null;
          }
        }
        return null;
      });

      // When your component mounts and the shadow root is available...
      Promise.all(sheetPromises).then((sheets) => {
        // Filter out any sheets that failed to load
        const validSheets = sheets.filter(Boolean);

        // Apply the array of constructed stylesheets to the shadow root
        // This is synchronous and does not trigger new network requests
        shadowRef.current.adoptedStyleSheets = validSheets;
      });
    }
    if (!contentRootRef.current && shadowRef.current) {
      contentRootRef.current = ReactDOM.createRoot(shadowRef.current);
    }
  }, []);

  useEffect(() => {
    let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(app);
    if (errors.length > 0) {
      component = errReportComponent(errors, "Main.xmlui", erroneousCompoundComponentName);
    }
    const compoundComponents: CompoundComponentDef[] = (components ?? []).map((src) => {
      const isErrorReportComponent = typeof src !== "string";
      if (isErrorReportComponent) {
        return src;
      }
      let { errors, component, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
        src as string,
      );
      if (errors.length > 0) {
        return errReportComponent(errors, `nested xmlui`, erroneousCompoundComponentName);
      }
      return component;
    });

    let globalProps = {
      name: config?.name,
      ...(config?.appGlobals || {}),
      apiUrl,
    };

    // css variables are leaking into to shadow dom, so we reset them here
    const themeVarReset = {};
    Object.keys(theme.themeStyles).forEach((key) => {
      themeVarReset[key] = "initial";
    });

    contentRootRef.current?.render(
      <ErrorBoundary node={component}>
        <ApiInterceptorProvider
          parentInterceptorContext={parentInterceptorContext}
          key={`app-${refreshVersion}`}
          interceptor={mock}
          waitForApiInterceptor={true}
        >
          <div style={{ height, ...style, ...themeVarReset }}>
            <AppRoot
              isNested={true}
              previewMode={true}
              standalone={true}
              trackContainerHeight={height ? "fixed" : "auto"}
              node={component}
              globalProps={globalProps}
              defaultTheme={activeTheme || config?.defaultTheme}
              defaultTone={toneToApply as ThemeTone}
              contributes={{
                compoundComponents,
                themes: config?.themes,
              }}
              resources={config?.resources}
              extensionManager={componentRegistry.getExtensionManager()}
            />
          </div>
        </ApiInterceptorProvider>
      </ErrorBoundary>,
    );
  }, [
    activeTheme,
    app,
    componentRegistry,
    components,
    config?.appGlobals,
    config?.defaultTheme,
    config?.name,
    config?.resources,
    config?.themes,
    height,
    mock,
    parentInterceptorContext,
    style,
    theme.themeStyles,
    toneToApply,
    refreshVersion
  ]);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        // Unmount the content root after a delay (and only if the component is not mounted anymore, could happen in dev mode - double useEffect call)
        if (!mountedRef.current) {
          contentRootRef.current?.unmount();
          contentRootRef.current = null;
        }
      }, 0);
    };
  }, []);

  return (
    <>
      <div
        ref={rootRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          position: "relative",
          isolation: "isolate",
        }}
      />
    </>
  );
}
