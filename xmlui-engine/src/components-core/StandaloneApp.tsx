import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM, { Root } from "react-dom/client";

import type { StandaloneAppDescription, StandaloneJsonConfig } from "@components-core/abstractions/standalone";
import type { ComponentDef, CompoundComponentDef, ComponentLike } from "@abstractions/ComponentDefs";
import type { AppComponentDef } from "@components/App/App";
import type { ThemeDefinition, ThemeTone } from "@components-core/theming/abstractions";
import type { CollectedDeclarations } from "@abstractions/scripting/ScriptingSourceTree";
import type { ComponentRendererDef } from "@abstractions/RendererDefs";

import "../index.scss";
import RootComponent from "@components-core/RootComponent";
import { normalizePath } from "@components-core/utils/misc";
import { ApiInterceptorProvider } from "@components-core/interception/ApiInterceptorProvider";
import { EMPTY_OBJECT } from "@components-core/constants";
import { codeBehindFileExtension, componentFileExtension } from "../parsers/ueml/fileExtensions";
import { parseXmlUiMarkup } from "@components-core/xmlui-parser";
import { useIsomorphicLayoutEffect } from "./utils/hooks";

// --- The properties of the standalone app
type StandaloneAppProps = {
  appDef?: StandaloneAppDescription;
  decorateComponentsWithTestId?: boolean;
  runtime?: any;
  components?: ComponentRendererDef[];
};

// --- This react component represents a standalone app connected with its environment
function StandaloneApp({
  appDef,
  decorateComponentsWithTestId,
  runtime,
  components: customComponents,
}: StandaloneAppProps) {
  const servedFromSingleFile = useMemo(() => {
    return typeof window !== "undefined" && window.location.href.startsWith("file");
  }, []);

  const standaloneApp = useStandalone(appDef, runtime);
  usePrintVersionNumber(standaloneApp);

  if (!standaloneApp) {
    return null;
  }

  const {
    apiInterceptor,
    name,
    globals,
    defaultTheme,
    defaultTone,
    resources,
    resourceMap,
    entryPoint,
    components,
    themes,
  } = standaloneApp;

  return (
    <ApiInterceptorProvider interceptor={apiInterceptor}>
      <RootComponent
        servedFromSingleFile={servedFromSingleFile}
        decorateComponentsWithTestId={decorateComponentsWithTestId}
        node={entryPoint!}
        standalone={true}
        // @ts-ignore
        baseName={typeof window !== "undefined" ? window.__PUBLIC_PATH || "" : ""}
        globalProps={{
          name: name,
          ...(globals || {}),
        }}
        defaultTheme={defaultTheme}
        defaultTone={defaultTone as ThemeTone}
        resources={resources}
        resourceMap={resourceMap}
        contributes={{
          compoundComponents: components,
          components: customComponents,
          themes,
        }}
      />
    </ApiInterceptorProvider>
  );
}

async function parseComponentResp(response: Response, legacyXmlUiParser?: boolean) {
  if (response.url.toLowerCase().endsWith(".xmlui")) {
    return parseXmlUiMarkup(await response.text(), undefined, !!legacyXmlUiParser);
  }
  return response.json();
}

function matchesFileName(path: string, fileName: string) {
  return (
    path.endsWith(`/${fileName}.ts`) ||
    path.endsWith(`/${fileName}.js`) ||
    path.endsWith(`/${fileName}.${componentFileExtension}`) ||
    path.endsWith(`/${fileName}.${codeBehindFileExtension}`)
  );
}

function matchesFolder(path: string, folderName: string) {
  return path.includes(`/${folderName}/`);
}

function resolveRuntime(runtime: Record<string, any>): StandaloneAppDescription {
  let config: StandaloneAppDescription | undefined;
  let entryPoint: ComponentDef | undefined;
  let entryPointCodeBehind: CollectedDeclarations | undefined;
  let themes: Array<ThemeDefinition> = [];
  let apiInterceptor;

  const componentsByFileName: Record<string, CompoundComponentDef> = {};
  const codeBehindsByFileName: Record<string, CollectedDeclarations> = {};

  for (const [key, value] of Object.entries(runtime)) {
    if (matchesFileName(key, "config")) {
      config = value.default;
    }
    if (matchesFileName(key, "Main") || matchesFileName(key, "App")) {
      if (key.endsWith(codeBehindFileExtension)) {
        entryPointCodeBehind = value.default;
      } else {
        entryPoint = value.default;
      }
    }
    if (matchesFileName(key, "api")) {
      apiInterceptor = value.default;
    }
    if (matchesFolder(key, "components")) {
      if (key.endsWith(codeBehindFileExtension)) {
        codeBehindsByFileName[key] = value.default;
      } else {
        componentsByFileName[key] = value.default;
      }
    }
    if (matchesFolder(key, "themes")) {
      themes.push(value.default);
    }
  }
  const safeEntryPoint = config?.entryPoint || entryPoint;
  const entryPointWithCodeBehind = {
    ...safeEntryPoint,
    vars: {
      ...entryPointCodeBehind?.vars,
      ...safeEntryPoint?.vars,
    },
    functions: entryPointCodeBehind?.functions,
    scriptError: entryPointCodeBehind?.moduleErrors,
  } as ComponentLike;
  let components: Array<CompoundComponentDef> = [];
  if (config?.components) {
    components = config.components;
  } else {
    Object.entries(componentsByFileName).forEach(([key, compound]) => {
      const componentCodeBehind = codeBehindsByFileName[`${key}.xs`]; //TODO illesg temp, (use codebehindFileExtension)
      const componentWithCodeBehind = {
        ...compound,
        component: {
          ...compound.component,
          vars: {
            ...compound.component.vars,
            ...componentCodeBehind?.vars,
          },
          functions: componentCodeBehind?.functions,
          scriptError: componentCodeBehind?.moduleErrors,
        },
      };
      components.push(componentWithCodeBehind);
    });
  }

  return {
    ...config,
    entryPoint: entryPointWithCodeBehind,
    components: components,
    themes: config?.themes || themes,
    apiInterceptor: config?.apiInterceptor || apiInterceptor,
  };
}

function mergeGivenAppDefWithRuntime(
  resolvedRuntime: StandaloneAppDescription,
  standaloneAppDef: StandaloneAppDescription | undefined
) {
  if (!standaloneAppDef) {
    return resolvedRuntime;
  }
  return {
    ...standaloneAppDef,
    entryPoint: standaloneAppDef.entryPoint || resolvedRuntime.entryPoint,
    components: standaloneAppDef.components || resolvedRuntime.components,
    themes: standaloneAppDef.themes || resolvedRuntime.themes,
    apiInterceptor: standaloneAppDef.apiInterceptor || resolvedRuntime.apiInterceptor,
  };
}

function getStandalone(
  standaloneAppDef: StandaloneAppDescription | undefined,
  runtime: Record<string, any> = EMPTY_OBJECT
) {
  //TODO read text/xmlui-config json
  const servedFromSingleFile =
    typeof document !== "undefined" && document.querySelector('script[type="text/xmlui"]') !== null;
  if (servedFromSingleFile) {
    let entryPoint: AppComponentDef | null = null;
    const componentNodes = document.querySelectorAll('script[type="text/xmlui"]');
    const components: Array<CompoundComponentDef> = [];
    for (let i = 0; i < componentNodes.length; i++) {
      const value = componentNodes[i];
      const componentDef = parseXmlUiMarkup(value.textContent!);
      if (!componentDef) {
        continue;
      }
      if ("type" in componentDef && componentDef.type === "App") {
        entryPoint = componentDef as AppComponentDef;
      } else {
        components.push(componentDef as CompoundComponentDef);
      }
    }
    if (entryPoint === null) {
      throw new Error("No App component specified");
    }
    const configNode = document.querySelector('script[type="text/xmlui-config"]');
    const config: StandaloneJsonConfig = configNode === null ? {} : JSON.parse(configNode.textContent!);
    const themes: Array<ThemeDefinition> = [];
    const themeNodes = document.querySelectorAll('script[type="text/xmlui-theme"]');
    themeNodes.forEach((value) => {
      themes.push(JSON.parse(value.textContent!) as ThemeDefinition);
    });

    const appDef: StandaloneAppDescription = {
      ...config,
      entryPoint,
      components,
      themes,
    };
    return appDef;
  }

  const resolvedRuntime = resolveRuntime(runtime);
  const appDef = mergeGivenAppDefWithRuntime(resolvedRuntime, standaloneAppDef);

  if (process.env.VITE_DEV_MODE || process.env.VITE_BUILD_MODE === "INLINE_ALL") {
    if (!appDef) {
      throw new Error("couldn't find the application metadata");
    }
    return appDef;
  }
  return null;
}

// --- This React hook prepares the runtime environment of a standalone app using its definition
function useStandalone(
  standaloneAppDef: StandaloneAppDescription | undefined,
  runtime: Record<string, any> = EMPTY_OBJECT
) {
  const [standaloneApp, setStandaloneApp] = useState<StandaloneAppDescription | null>(
    getStandalone(standaloneAppDef, runtime)
  );

  useIsomorphicLayoutEffect(() => {
    (async function () {
      //TODO read text/xmlui-config json
      const servedFromSingleFile = document.querySelector('script[type="text/xmlui"]') !== null;
      if (servedFromSingleFile) {
        let entryPoint: AppComponentDef | null = null;
        const componentNodes = document.querySelectorAll('script[type="text/xmlui"]');
        const components: Array<CompoundComponentDef> = [];
        for (let i = 0; i < componentNodes.length; i++) {
          const value = componentNodes[i];
          const componentDef = parseXmlUiMarkup(value.textContent!);
          if (!componentDef) {
            continue;
          }
          if ("type" in componentDef && componentDef.type === "App") {
            entryPoint = componentDef as AppComponentDef;
          } else {
            components.push(componentDef as CompoundComponentDef);
          }
        }
        if (entryPoint === null) {
          throw new Error("No App component specified");
        }
        const configNode = document.querySelector('script[type="text/xmlui-config"]');
        const config: StandaloneJsonConfig = configNode === null ? {} : JSON.parse(configNode.textContent!);
        const themes: Array<ThemeDefinition> = [];
        const themeNodes = document.querySelectorAll('script[type="text/xmlui-theme"]');
        themeNodes.forEach((value) => {
          themes.push(JSON.parse(value.textContent!) as ThemeDefinition);
        });

        let appDef: StandaloneAppDescription = {
          ...config,
          entryPoint,
          components,
          themes,
        };
        setStandaloneApp(appDef);
        return;
      }

      const resolvedRuntime = resolveRuntime(runtime);
      const appDef = mergeGivenAppDefWithRuntime(resolvedRuntime, standaloneAppDef);

      if (process.env.VITE_DEV_MODE || process.env.VITE_BUILD_MODE === "INLINE_ALL") {
        if (!appDef) {
          throw new Error("couldn't find the application metadata");
        }
        setStandaloneApp(appDef);
        return;
      }

      if (process.env.VITE_BUILD_MODE === "CONFIG_ONLY") {
        const configResponse = await fetch(normalizePath("config.json")!);
        const config: StandaloneJsonConfig = await configResponse.json();

        const themePromises: Promise<ThemeDefinition>[] = [];
        config.themes?.forEach((theme) => {
          themePromises.push(fetch(normalizePath(theme)!).then((value) => value.json()));
        });
        const themes = await Promise.all(themePromises);
        setStandaloneApp({
          ...appDef,
          name: config.name,
          globals: config.globals,
          defaultTheme: config.defaultTheme,
          resources: config.resources,
          resourceMap: config.resourceMap,
          themes,
        });
        return;
      }

      //default mode: process.env.VITE_BUILD_MODE === "ALL"
      const configResponse = await fetch(normalizePath("config.json")!);
      const config: StandaloneJsonConfig = await configResponse.json();
      const legacyXmlUiParser = config.globals?.legacyXmlUiParser;

      const entryPointPromise = fetch(normalizePath("App.xmlui")!).then((value) => parseComponentResp(value, legacyXmlUiParser));
      const themePromises = config.themes?.map((themePath) => {
        return fetch(normalizePath(themePath)!).then((value) => parseComponentResp(value, legacyXmlUiParser)) as Promise<ThemeDefinition>;
      });

      const componentPromises = config.components?.map((componentPath) => {
        return fetch(normalizePath(componentPath)!).then((value) =>
          parseComponentResp(value, legacyXmlUiParser)
        ) as Promise<CompoundComponentDef>;
      });

      let [entryPoint, components, themes] = await Promise.all([
        entryPointPromise,
        Promise.all(componentPromises || []),
        Promise.all(themePromises || []),
      ]);

      setStandaloneApp({
        ...config,
        themes,
        components,
        entryPoint,
      });
    })();
  }, [runtime, standaloneAppDef]);
  return standaloneApp;
}

// --- This React hook logs the app's version number to the browser's console at startup
function usePrintVersionNumber(standaloneApp: StandaloneAppDescription | null) {
  const logged = useRef(false);
  useEffect(() => {
    if (standaloneApp?.name && !logged.current) {
      console.log(`${standaloneApp.name} version: `, process.env.VITE_APP_VERSION || "dev");
      logged.current = true;
    }
  }, [standaloneApp?.name]);
}

let contentRoot: Root | null = null;

export function startApp(runtime: any, components?: ComponentRendererDef[]) {
  let rootElement: HTMLElement | null = document.getElementById("root");
  if(!rootElement){
    rootElement = document.createElement("div");
    rootElement.setAttribute("id", "root");
    document.body.appendChild(rootElement);
  }
  if (!contentRoot) {
    contentRoot = ReactDOM.createRoot(rootElement);
  }
  contentRoot.render(<StandaloneApp runtime={runtime} components={components} />);
  return contentRoot;
}

export default StandaloneApp;
