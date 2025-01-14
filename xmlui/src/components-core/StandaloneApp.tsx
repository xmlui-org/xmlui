import { useEffect, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";

import type {
  StandaloneAppDescription,
  StandaloneJsonConfig,
} from "@components-core/abstractions/standalone";
import type {
  ComponentDef,
  CompoundComponentDef,
  ComponentLike,
} from "@abstractions/ComponentDefs";
import type { ThemeDefinition, ThemeTone } from "@components-core/theming/abstractions";
import type { CollectedDeclarations } from "@abstractions/scripting/ScriptingSourceTree";
import type { ComponentRendererDef } from "@abstractions/RendererDefs";

import "../index.scss";
import AppRoot from "@components-core/AppRoot";
import { normalizePath } from "@components-core/utils/misc";
import { ApiInterceptorProvider } from "@components-core/interception/ApiInterceptorProvider";
import { EMPTY_OBJECT } from "@components-core/constants";
import {
  errReportComponent,
  errReportMessage,
  errReportModuleErrors,
  errReportScriptError,
  xmlUiMarkupToComponent,
} from "@components-core/xmlui-parser";
import { useIsomorphicLayoutEffect } from "./utils/hooks";
import {
  componentFileExtension,
  codeBehindFileExtension,
} from "../parsers/xmlui-parser/fileExtensions";
import { Parser } from "../parsers/scripting/Parser";
import {
  collectCodeBehindFromSource,
  removeCodeBehindTokensFromTree,
} from "../parsers/scripting/code-behind-collect";
import { ComponentRegistry } from "@components/ComponentProvider";
import { checkXmlUiMarkup } from "@components-core/markup-check";
import StandaloneComponentManager from "./StandaloneComponentManager";
import { builtInThemes } from "@components-core/theming/ThemeProvider";

const MAIN_FILE = "Main." + componentFileExtension;
const MAIN_CODE_BEHIND_FILE = "Main." + codeBehindFileExtension;
const CONFIG_FILE = "config.json";

// --- The properties of the standalone app
type StandaloneAppProps = {
  // --- The standalone app description (the engine renders this definition)
  appDef?: StandaloneAppDescription;

  // --- In E2E tests, we can decorate the components with test IDs
  decorateComponentsWithTestId?: boolean;

  // --- Debugging can be enabled or disabled
  debugEnabled?: boolean;

  // --- The runtime environment of the standalone app (for pre-compiled apps)
  runtime?: any;

  // --- Custom components to be added
  components?: ComponentRendererDef[];

  // --- The object responsible for managing the standalone components
  componentManager?: StandaloneComponentManager;
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
  decorateComponentsWithTestId,
  debugEnabled = true,
  runtime,
  components: customComponents,
  componentManager,
}: StandaloneAppProps) {
  const servedFromSingleFile = useMemo(() => {
    return typeof window !== "undefined" && window.location.href.startsWith("file");
  }, []);

  // --- Fetch all files constituting the standalone app, including components,
  // --- themes, and other artifacts. Display the app version numbers in the
  // --- console.
  const standaloneApp = useStandalone(appDef, runtime, componentManager);
  usePrintVersionNumber(standaloneApp);

  if (!standaloneApp) {
    // --- Problems found, the standalone app cannot run
    return null;
  }

  const {
    apiInterceptor,
    name,
    appGlobals,
    defaultTheme,
    defaultTone,
    resources,
    resourceMap,
    entryPoint,
    components,
    themes,
    sources,
  } = standaloneApp;

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
    <ApiInterceptorProvider interceptor={mockedApi} useHashBasedRouting={useHashBasedRouting}>
      <AppRoot
        servedFromSingleFile={servedFromSingleFile}
        decorateComponentsWithTestId={shouldDecorateWithTestId}
        node={entryPoint!}
        standalone={true}
        debugEnabled={debugEnabled}
        // @ts-ignore
        routerBaseName={typeof window !== "undefined" ? window.__PUBLIC_PATH || "" : ""}
        globalProps={{
          name: name,
          ...(appGlobals || {}),
        }}
        defaultTheme={defaultTheme}
        defaultTone={defaultTone as ThemeTone}
        resources={resources}
        resourceMap={resourceMap}
        sources={sources}
        componentManager={componentManager}
        contributes={{
          compoundComponents: components,
          components: customComponents,
          themes,
        }}
      />
    </ApiInterceptorProvider>
  );
}

// --- This type represents the parsed structure of a component markup of
// --- code-behind file (for further processing)
type ParsedResponse = {
  // --- The component definition (it may be a compound component)
  component?: ComponentDef | CompoundComponentDef;

  // --- The optional code-behind source code of the component
  codeBehind?: CollectedDeclarations;

  // --- The optional source code of the component (for debugging or learning purposes)
  src?: string;

  // --- The optional file name of the component (for debugging or learning purposes)
  file?: string;

  // --- The flag indicating if the component has errors
  hasError?: boolean;
};

/**
 * This function parses the response of a fetch retrieving the contents of a
 * component markup file.
 * @param response The response coming from the fetch
 * @returns If parsing is successful, it returns the parsed response containing
 * the component definition. Otherwise, it returns a component definition that
 * displays the errors.
 */
async function parseComponentMarkupResponse(response: Response): Promise<ParsedResponse> {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.url}`);
  }
  const code = await response.text();
  const fileId = response.url;
  let { component, errors, erroneousCompoundComponentName } = xmlUiMarkupToComponent(code, fileId);
  if (errors.length > 0) {
    const compName =
      erroneousCompoundComponentName ??
      response.url.substring(
        response.url.lastIndexOf("/") + 1,
        response.url.length - ".xmlui".length,
      );
    component = errReportComponent(errors, fileId, compName);
  }
  return {
    component,
    src: code,
    file: fileId,
    hasError: errors.length > 0,
  };
}

/**
 * This function parses the response of a fetch retrieving the contents of a
 * code-behind file.
 * @param response The response coming from the fetch
 * @returns If parsing is successful, it returns the parsed response containing
 * the code-behind declarations. Otherwise, it returns a component definition that
 * displays the errors.
 */
async function parseCodeBehindResponse(response: Response): Promise<ParsedResponse> {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.url}`);
  }
  const code = await response.text();
  const parser = new Parser(code);
  try {
    parser.parseStatements();
  } catch (e) {
    if (parser.errors.length > 0) {
      return {
        component: errReportScriptError(parser.errors[0], response.url),
        file: response.url,
        hasError: true,
      };
    }
  }

  const codeBehind = collectCodeBehindFromSource(
    "Main",
    code,
    () => {
      return "";
    },
    (a) => a,
  );
  if (Object.keys(codeBehind.moduleErrors ?? {}).length > 0) {
    return {
      component: errReportModuleErrors(codeBehind.moduleErrors, response.url),
      file: response.url,
      hasError: true,
    };
  }

  // --- Remove the code-behind tokens from the tree shrinking the tree
  removeCodeBehindTokensFromTree(codeBehind);
  return {
    codeBehind: codeBehind,
    file: response.url,
  };
}

// --- Tests is the given path matches the speified file name
function matchesFileName(path: string, fileName: string) {
  return (
    path.endsWith(`/${fileName}.ts`) ||
    path.endsWith(`/${fileName}.js`) ||
    path.endsWith(`/${fileName}.${componentFileExtension}`) ||
    path.endsWith(`/${fileName}.${codeBehindFileExtension}`)
  );
}

// --- Tests if the given path contains the specified folder
function matchesFolder(path: string, folderName: string) {
  return path.includes(`/${folderName}/`);
}

/**
 * This function turns a collection of runtime file declarations into a standalone
 * app description.
 * @param runtime A hash object containing the runtime files. The keys are the file
 * paths and the values are the file contents.
 * @returns The standalone app description.
 *
 * When the standalone app is pre-compiled, each property in `runtime` holds such a
 * pre-compiled item. Otherwise, `runtime` is an empty object.
 *
 * While processing the files here, we can assume they are free from compilation
 * errors, as such errors would be observed in the compile phase.
 */
function resolveRuntime(runtime: Record<string, any>): StandaloneAppDescription {
  // --- Collect the components and their sources. We pass the sources to the standalone app
  // --- so that it can be used for error display and debugging purposes.
  const sources: Record<string, string> = {};
  const componentsByFileName: Record<string, CompoundComponentDef> = {};
  const codeBehindsByFileName: Record<string, CollectedDeclarations> = {};
  const themes: Array<ThemeDefinition> = [];

  // --- Some working variables
  let config: StandaloneAppDescription | undefined;
  let entryPoint: ComponentDef | undefined;
  let entryPointCodeBehind: CollectedDeclarations | undefined;
  let apiInterceptor: any;

  // --- Process the runtime files
  for (const [key, value] of Object.entries(runtime)) {
    if (matchesFileName(key, "config")) {
      // --- We assume that the config file has a default export and this
      // --- export is the standalone app's configuration.
      config = value.default;
    }

    // --- We assume that the entry point is either named "Main" or "App".
    if (matchesFileName(key, "Main") || matchesFileName(key, "App")) {
      if (key.endsWith(codeBehindFileExtension)) {
        // --- "default" contains the functions and variables declared in the
        // --- code behind file.
        entryPointCodeBehind = value.default;
      } else {
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        entryPoint = value.default.component;
        if (value.default.file) {
          sources[value.default.file] = value.default.src;
        }
      }
    }

    // --- Use API emulation if available
    if (matchesFileName(key, "api")) {
      apiInterceptor = value.default;
    }

    // --- Collect the components and their code behinds
    if (matchesFolder(key, "components")) {
      if (key.endsWith(`.${codeBehindFileExtension}`)) {
        // --- "default" contains the functions and variables declared in the
        // --- component's code behind file.
        codeBehindsByFileName[key] = value.default;
      } else {
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        componentsByFileName[key] = value.default.component;
        sources[value.default.file] = value.default.src;
      }
    }

    // --- Collect the themes declared with the app
    if (matchesFolder(key, "themes")) {
      themes.push(value.default);
    }
  }

  // --- We have an entry point defined in the configuration file or in the main app file.
  const safeEntryPoint = config?.entryPoint || entryPoint;

  // --- We may have a code-behind file. If so, we merge the variables and functions
  const entryPointWithCodeBehind = {
    ...safeEntryPoint,
    vars: {
      ...entryPointCodeBehind?.vars,
      ...safeEntryPoint?.vars,
    },
    functions: entryPointCodeBehind?.functions,
    scriptError: entryPointCodeBehind?.moduleErrors,
  } as ComponentLike;

  // --- Collect the component definition we pass to the rendering engine
  let components: Array<CompoundComponentDef> = [];
  if (config?.components) {
    // --- We have a list of components defined in the configuration file
    components = config.components;
  } else {
    // --- Use the components collected from the runtime files; merge the components
    // --- with their code behinds
    Object.entries(componentsByFileName).forEach(([key, compound]) => {
      const componentCodeBehind = codeBehindsByFileName[`${key}.xs`];
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

  // --- Done.
  return {
    ...config,
    entryPoint: entryPointWithCodeBehind,
    components,
    themes: config?.themes || themes,
    apiInterceptor: config?.apiInterceptor || apiInterceptor,
    sources,
  };
}

/**
 * Merges app definitions
 * @param resolvedRuntime Standalone app definition coming from the resolved runtime
 * @param standaloneAppDef Standalode app definition coming from the source
 * @returns Merged standalone app definition
 */
function mergeAppDefWithRuntime(
  resolvedRuntime: StandaloneAppDescription,
  standaloneAppDef: StandaloneAppDescription | undefined,
): StandaloneAppDescription {
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

/**
 * Fetch the up-to-date state of the source file
 * @param url The URL to fetch the source file from
 * @returns The source file contents response
 */
async function fetchWithoutCache(url: string): Promise<Response> {
  return fetch(normalizePath(url), {
    headers: {
      "Cache-Control": "no-cache, no-store",
    },
  });
}

/**
 * Using its definition, this React hook prepares the runtime environment of a
 * standalone app. It runs every time an app source file changes.
 * @param standaloneAppDef The standalone app description
 * @param runtime The pre-compiled runtime environment
 * @returns The prepared StandaloneAppDescription if the collection is
 * successful; otherwise, null.
 */
function useStandalone(
  standaloneAppDef: StandaloneAppDescription | undefined,
  runtime: Record<string, any> = EMPTY_OBJECT,
  componentManager?: StandaloneComponentManager,
): StandaloneAppDescription | null {
  const [standaloneApp, setStandaloneApp] = useState<StandaloneAppDescription | null>(() => {
    // --- Initialize the standalone app
    const resolvedRuntime = resolveRuntime(runtime);
    const appDef = mergeAppDefWithRuntime(resolvedRuntime, standaloneAppDef);

    // --- In dev mode or when the app is inlined (provided we do not use the standalone mode),
    // --- we must have the app definition available.
    if (
      (process.env.VITE_DEV_MODE || process.env.VITE_BUILD_MODE === "INLINE_ALL") &&
      !process.env.VITE_STANDALONE
    ) {
      if (!appDef) {
        throw new Error("couldn't find the application metadata");
      }
      return appDef;
    }

    // --- No standalone app yet, we need to get that from the fetched source code
    return null;
  });

  useIsomorphicLayoutEffect(() => {
    (async function () {
      const resolvedRuntime = resolveRuntime(runtime);
      const appDef = mergeAppDefWithRuntime(resolvedRuntime, standaloneAppDef);

      // --- In dev mode or when the app is inlined (provided we do not use the standalone mode),
      // --- we must have the app definition available.
      if (
        (process.env.VITE_DEV_MODE || process.env.VITE_BUILD_MODE === "INLINE_ALL") &&
        !process.env.VITE_STANDALONE
      ) {
        if (!appDef) {
          throw new Error("couldn't find the application metadata");
        }
        setStandaloneApp(appDef);
        return;
      }

      // --- In standalone mode, we must fetch the XMLUI app's source files,
      // --- compile them, and prepare the app's definition for the rendering
      // --- engine.
      if (process.env.VITE_BUILD_MODE === "CONFIG_ONLY") {
        // --- In config-only mode, we override the pre-compiled app definition
        // --- with elements from the configuration file. Note that we do not
        // --- check whether the config file's content is semantically valid.
        const configResponse = await fetchWithoutCache(CONFIG_FILE);
        const config: StandaloneJsonConfig = await configResponse.json();

        const themePromises: Promise<ThemeDefinition>[] = [];
        config.themes?.forEach((theme) => {
          themePromises.push(fetchWithoutCache(theme).then((value) => value.json()));
        });
        const themes = await Promise.all(themePromises);
        setStandaloneApp({
          ...appDef,
          name: config.name,
          appGlobals: config.appGlobals,
          defaultTheme: config.defaultTheme,
          resources: config.resources,
          resourceMap: config.resourceMap,
          themes,
        });
        return;
      }

      // --- Fetch the main file
      const entryPointPromise = new Promise(async (resolve) => {
        try {
          const resp = await fetchWithoutCache(MAIN_FILE);
          if (resp.ok) {
            resolve(parseComponentMarkupResponse(resp));
          } else {
            resolve({
              component: errReportMessage(`Failed to load the main component (${MAIN_FILE})`),
              file: MAIN_FILE,
              hasError: true,
            });
          }
        } catch (e) {
          resolve(null);
        }
      }) as any;

      // --- Fetch the main code-behind file (if any)
      const entryPointCodeBehindPromise = new Promise(async (resolve) => {
        try {
          const resp = await fetchWithoutCache(MAIN_CODE_BEHIND_FILE);
          const codeBehind = await parseCodeBehindResponse(resp);
          resolve(codeBehind.hasError ? codeBehind : codeBehind.codeBehind);
        } catch (e) {
          resolve(null);
        }
      }) as any;

      // --- Fetch the configuration file (we do not check whether the content is semantically valid)
      let config: StandaloneJsonConfig = undefined;
      try {
        const configResponse = await fetchWithoutCache(CONFIG_FILE);
        config = await configResponse.json();
      } catch (e) {}

      // --- Fetch the themes according to the configuration
      const themePromises = config?.themes?.map((themePath) => {
        return fetchWithoutCache(themePath).then((value) =>
          value.json(),
        ) as Promise<ThemeDefinition>;
      });

      // --- Fetch component files according to the configuration
      const componentPromises = config?.components?.map(async (componentPath) => {
        const value = await fetchWithoutCache(componentPath);
        if (componentPath.endsWith(`.${componentFileExtension}`)) {
          return await parseComponentMarkupResponse(value);
        } else {
          return await parseCodeBehindResponse(value);
        }
      });

      // --- Let the promises resolve
      const [loadedEntryPoint, loadedEntryPointCodeBehind, loadedComponents, themes] =
        await Promise.all([
          entryPointPromise,
          entryPointCodeBehindPromise,
          Promise.all(componentPromises || []),
          Promise.all(themePromises || []),
        ]);

      // --- Collect the elements of the standalone app (and potential errors)
      const errorComponents: ComponentDef[] = [];

      // --- Check if the main component has errors
      if (loadedEntryPoint.hasError) {
        errorComponents.push(loadedEntryPoint!.component as ComponentDef);
      }
      if (loadedEntryPointCodeBehind?.hasError) {
        errorComponents.push(loadedEntryPointCodeBehind.component as ComponentDef);
      }

      // --- Check if any of the components have markup errors
      loadedComponents.forEach((compWrapper) => {
        if (compWrapper.hasError) {
          errorComponents.push(compWrapper.component as ComponentDef);
        }
      });

      // --- Collect the sources and code-behinds
      const sources: Record<string, string> = {};
      const codeBehinds: any = {};

      // --- The main component source
      if (loadedEntryPoint.file) {
        sources[loadedEntryPoint.file] = loadedEntryPoint.src;
      }

      // --- Components may have code-behind files
      loadedComponents.forEach((compWrapper) => {
        if (compWrapper?.file?.endsWith(`.${codeBehindFileExtension}`)) {
          codeBehinds[compWrapper.file] = compWrapper.codeBehind;
        } else {
          if (compWrapper.file) {
            sources[compWrapper.file] = compWrapper.src;
          }
        }
      });

      // --- Assemble the runtime for the main app file
      const entryPointWithCodeBehind = {
        ...loadedEntryPoint.component,
        vars: {
          ...loadedEntryPointCodeBehind?.vars,
          ...loadedEntryPoint.component.vars,
        },
        functions: loadedEntryPointCodeBehind?.functions,
        scriptError: loadedEntryPointCodeBehind?.moduleErrors,
      };

      const defaultTheme = (entryPointWithCodeBehind as ComponentDef).props?.defaultTheme;
      // --- We test whether the default theme is not from a binding
      // --- expression and is not a built-in theme already loaded. If so,
      // --- we load it from the `themes` folder.
      if (defaultTheme && typeof defaultTheme === "string" && !defaultTheme.includes("{")) {
        if (
          !builtInThemes.find((theme) => theme.id === defaultTheme) &&
          !themes.find((theme) => theme.id === defaultTheme)
        ) {
          themes.push(
            await fetchWithoutCache(`themes/${defaultTheme}.json`).then((value) => value.json()),
          );
        }
      }

      // --- Assemble the runtime for the components
      const componentsWithCodeBehinds = loadedComponents
        .filter((compWrapper) => !compWrapper?.file?.endsWith(".xmlui.xs"))
        .map((compWrapper) => {
          const componentCodeBehind = codeBehinds[compWrapper.file + ".xs"];
          return {
            ...compWrapper.component,
            component: {
              ...(compWrapper.component as any).component,
              vars: {
                ...(compWrapper.component as any).component.vars,
                ...componentCodeBehind?.vars,
              },
              functions: componentCodeBehind?.functions,
              scriptError: componentCodeBehind?.moduleErrors,
            },
          };
        });

      // --- We may have components that are not in the configuration file.
      // --- We need to load them and their code-behinds. First, we collect
      // --- the components to load.
      let componentsToLoad = collectMissingComponents(
        entryPointWithCodeBehind,
        componentsWithCodeBehinds,
        undefined,
        componentManager,
      );

      // --- Try to load the components referenced in the markup, collect
      // --- those that failed
      const componentsFailedToLoad = new Set();
      while (componentsToLoad.size > 0) {
        const componentPromises = [...componentsToLoad].map(async (componentPath) => {
          try {
            // --- Promises for the component markup files
            const componentPromise = fetchWithoutCache(
              `components/${componentPath}.${componentFileExtension}`,
            );

            // --- Promises for the component code-behind files
            const componentCodeBehindPromise = new Promise(async (resolve) => {
              try {
                const codeBehindWrapper = await parseCodeBehindResponse(
                  await fetchWithoutCache(`components/${componentPath}.${codeBehindFileExtension}`),
                );
                if (codeBehindWrapper.hasError) {
                  errorComponents.push(codeBehindWrapper.component as ComponentDef);
                }
                resolve(
                  codeBehindWrapper.hasError
                    ? codeBehindWrapper.component
                    : (codeBehindWrapper.codeBehind as any),
                );
              } catch {
                resolve(null);
              }
            }) as Promise<CollectedDeclarations>;

            // --- Let the promises resolve
            const [componentMarkup, componentCodeBehind] = await Promise.all([
              componentPromise,
              componentCodeBehindPromise,
            ]);

            // --- Parse the component markup and check for errors
            const compWrapper = await parseComponentMarkupResponse(componentMarkup);
            if (compWrapper.hasError) {
              errorComponents.push(compWrapper.component as ComponentDef);
            }
            sources[compWrapper.file] = compWrapper.src;

            return {
              ...compWrapper.component,
              component: {
                ...(compWrapper.component as any).component,
                vars: {
                  ...(compWrapper.component as any).component.vars,
                  ...componentCodeBehind?.vars,
                },
                functions: componentCodeBehind?.functions,
                scriptError: componentCodeBehind?.moduleErrors,
              },
            };
          } catch (e) {
            componentsFailedToLoad.add(componentPath);
            return null;
          }
        });
        const componentWrappers = await Promise.all(componentPromises);
        componentsWithCodeBehinds.push(...componentWrappers.filter((comp) => !!comp));
        componentsToLoad = collectMissingComponents(
          entryPointWithCodeBehind,
          componentsWithCodeBehinds,
          componentsFailedToLoad,
          componentManager,
        );
      }

      // --- Let's check for errors to display
      const errorComponent: ComponentDef | null =
        errorComponents.length > 0
          ? {
              type: "VStack",
              props: { gap: 0, padding: 0 },
              children: errorComponents,
            }
          : null;

      setStandaloneApp({
        ...config,
        themes,
        sources,
        components: componentsWithCodeBehinds as any,
        entryPoint: errorComponent || entryPointWithCodeBehind,
      });
    })();
  }, [runtime, standaloneAppDef]);
  return standaloneApp;
}

/**
 * Collect the missing components referenced by any part of the app
 * @param entryPoint The app's main markup
 * @param components The component markups
 * @param componentsFailedToLoad The components that failed to load here
 * @returns The components that are still missing
 */
function collectMissingComponents(
  entryPoint: ComponentDef | CompoundComponentDef,
  components: any[],
  componentsFailedToLoad = new Set(),
  componentManager?: StandaloneComponentManager,
) {
  // --- Add the discovered compound components to the registry
  const componentRegistry = new ComponentRegistry(
    { compoundComponents: components },
    componentManager,
  );

  // --- Check the xmlui markup. This check will find all unloaded components
  const result = checkXmlUiMarkup(entryPoint as ComponentDef, components, {
    getComponentProps: (componentName) => {
      return componentRegistry.lookupComponentRenderer(componentName)?.descriptor?.props;
    },
    acceptArbitraryProps: () => {
      return true;
    },
    getComponentValidator: () => {
      return null;
    },
    getComponentEvents: () => {
      return null;
    },
    componentRegistered: (componentName) => {
      return componentRegistry.hasComponent(componentName);
    },
  });

  componentRegistry.destroy();

  // --- Collect all missing components.Omit the components that failed to load
  return new Set(
    result
      .filter((r) => r.code === "M001")
      .map((r) => r.args[0])
      .filter((comp) => !componentsFailedToLoad.has(comp)),
  );
}

// --- This React hook logs the app's version number to the browser's console at startup
function usePrintVersionNumber(standaloneApp: StandaloneAppDescription | null) {
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current) {
      return;
    }
    logged.current = true;
    let log = `XMLUI version: ${process.env.VITE_XMLUI_VERSION || "dev"}`;
    if (standaloneApp?.name) {
      log += `; ${standaloneApp.name} version: ${process.env.VITE_APP_VERSION || "dev"}`;
    }
    console.log(log);
  }, [standaloneApp?.name]);
}

let contentRoot: Root | null = null;

/**
 * This function injects the StandaloneApp component into a React app. It looks
 * up a component with the "root" id as the host of the standalone app. If such
 * an element does not exist, it creates a `<div id="root">` element.
 * @param runtime The app's runtime representation
 * @param components The related component's runtime representation
 * @returns The content's root element
 */
export function startApp(
  runtime: any,
  components: ComponentRendererDef[] | undefined,
  componentManager: StandaloneComponentManager,
) {
  let rootElement: HTMLElement | null = document.getElementById("root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.setAttribute("id", "root");
    document.body.appendChild(rootElement);
  }
  if (!contentRoot) {
    contentRoot = ReactDOM.createRoot(rootElement);
  }
  contentRoot.render(
    <StandaloneApp runtime={runtime} components={components} componentManager={componentManager} />,
  );
  return contentRoot;
}

export default StandaloneApp;
