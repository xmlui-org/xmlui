import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";
import yaml from "js-yaml";

import type { StandaloneAppDescription, StandaloneJsonConfig } from "./abstractions/standalone";
import type {
  ComponentDef,
  ComponentLike,
  CompoundComponentDef,
} from "../abstractions/ComponentDefs";

import "../index.scss";
import { AppRoot } from "./rendering/AppRoot";
import { normalizePath } from "./utils/misc";
import { ApiInterceptorProvider } from "./interception/ApiInterceptorProvider";
import { EMPTY_OBJECT } from "./constants";
import {
  errReportComponent,
  errReportMessage,
  errReportModuleErrors,
  errReportScriptError,
  xmlUiMarkupToComponent,
} from "./xmlui-parser";
import { useIsomorphicLayoutEffect } from "./utils/hooks";
import {
  codeBehindFileExtension,
  componentFileExtension,
  moduleFileExtension,
} from "../parsers/xmlui-parser/fileExtensions";
import { Parser } from "../parsers/scripting/Parser";
import {
  collectCodeBehindFromSourceWithImports,
  removeCodeBehindTokensFromTree,
} from "../parsers/scripting/code-behind-collect";
import { ModuleResolver } from "../parsers/scripting/ModuleResolver";
import type { ModuleFetcher } from "../parsers/scripting/types";
import { ScriptExtractor } from "../parsers/scripting/ScriptExtractor";
import { ComponentRegistry } from "../components/ComponentProvider";
import { checkXmlUiMarkup, type MetadataHandler, visitComponent } from "./markup-check";
import StandaloneExtensionManager from "./StandaloneExtensionManager";
import { builtInThemes } from "./theming/ThemeProvider";
import type { Extension } from "../abstractions/ExtensionDefs";
import {
  getLintSeverity,
  lintApp,
  lintErrorsComponent,
  LintSeverity,
  printComponentLints,
} from "../parsers/xmlui-parser/lint";
import { collectedComponentMetadata } from "../components/collectedComponentMetadata";
import type { ThemeDefinition, ThemeTone } from "../abstractions/ThemingDefs";
import type {
  ComponentCompilation,
  ProjectCompilation,
} from "../abstractions/scripting/Compilation";
import { evalBinding } from "./script-runner/eval-tree-sync";
import type { BindingTreeEvaluationContext } from "./script-runner/BindingTreeEvaluationContext";
import { MetadataProvider } from "../language-server/services/common/metadata-utils";
import { extractParam } from "./utils/extractParam";
import type { CollectedDeclarations } from "./script-runner/ScriptingSourceTree";

const MAIN_FILE = "Main." + componentFileExtension;
const MAIN_CODE_BEHIND_FILE = "Main." + codeBehindFileExtension;
const GLOBALS_BUILT_RESOURCE = "/src/Globals.xs";
const GLOBALS_FILE = "Globals." + moduleFileExtension;
const CONFIG_FILE = "config.json";

const metadataProvider = new MetadataProvider(collectedComponentMetadata);

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
  const { standaloneApp, projectCompilation, globalVars } = useStandalone(
    appDef,
    runtime,
    extensionManager,
  );

  console.log("Runtime:", runtime);
  usePrintVersionNumber(standaloneApp);

  // --- Display build errors from the vite-xmlui-plugin if any exist
  useEffect(() => {
    const buildErrors: Array<{ importingFile: string; importedModule: string; errors: any[] }> = [];

    // --- Collect module errors from all runtime items (moduleErrors is a direct property on the module)
    Object.entries(runtime || {}).forEach(([key, module]: [string, any]) => {
      if (module?.moduleErrors && Object.keys(module.moduleErrors).length > 0) {
        Object.entries(module.moduleErrors).forEach(([modulePath, errors]: [string, any]) => {
          buildErrors.push({
            importingFile: key,
            importedModule: modulePath,
            errors: errors,
          });
        });
      }
    });

    // --- Display collected errors in console
    if (buildErrors.length > 0) {
      console.group("🔴 Build Errors Found");
      buildErrors.forEach(({ importingFile, importedModule, errors }) => {
        console.group(`${importingFile} imports ${importedModule}`);
        errors.forEach((err: any) => {
          console.error(`  [${err.code}] Line ${err.line}:${err.column} - ${err.text}`);
        });
        console.groupEnd();
      });
      console.groupEnd();
    }
  }, [runtime]);

  // Helper to filter out internal metadata (__tree_* keys) from globalVars
  // Exposes only the actual variable values to the renderer
  const filterGlobalVars = (vars: Record<string, any>): Record<string, any> => {
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(vars)) {
      if (!key.startsWith("__")) {
        filtered[key] = value;
      }
    }
    return filtered;
  };

  const { apiInterceptor,
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
  } = standaloneApp || {};

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
  // --- Also enable when xsVerbose is true (for inspector support).
  const shouldDecorateWithTestId =
    decorateComponentsWithTestId ||
    appGlobals?.xsVerbose === true ||
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
        projectCompilation={projectCompilation}
        decorateComponentsWithTestId={shouldDecorateWithTestId}
        node={entryPoint!}
        standalone={true}
        debugEnabled={debugEnabled}
        // @ts-ignore
        routerBaseName={typeof window !== "undefined" ? window.__PUBLIC_PATH || "" : ""}
        globalProps={globalProps}
        globalVars={filterGlobalVars(globalVars)}
        defaultTheme={defaultTheme}
        defaultTone={defaultTone as ThemeTone}
        resources={resources}
        resourceMap={resourceMap}
        sources={sources}
        extensionManager={extensionManager}
        contributes={contributes}
      >
        {children}
      </AppRoot>
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

  let codeBehind: CollectedDeclarations | undefined;

  // --- Extract inline script from markup using ScriptExtractor
  const scriptResult = ScriptExtractor.extractInlineScript(code);
  if (scriptResult) {
    const scriptContent = scriptResult.script;

    try {
      // --- Create a module fetcher for import support
      // --- Note: modulePath is already resolved by ModuleResolver.resolvePath()
      const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
        // --- Normalize the path for consistency across platforms (especially Windows)
        const normalizedPath = normalizePath(modulePath);
        const moduleResponse = await fetchWithoutCache(normalizedPath);
        if (!moduleResponse.ok) {
          throw new Error(`Failed to fetch module: ${normalizedPath}`);
        }
        return await moduleResponse.text();
      };

      // --- Collect code-behind with import support from inline scripts
      codeBehind = await collectCodeBehindFromSourceWithImports(
        fileId,
        scriptContent,
        moduleFetcher,
      );
      removeCodeBehindTokensFromTree(codeBehind);
    } catch (e) {
      console.error(`Error collecting imports from inline script in ${fileId}:`, e);
    }
  }

  let { component, errors, erroneousCompoundComponentName } = xmlUiMarkupToComponent(
    code,
    fileId,
    codeBehind,
  );
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
    codeBehind: codeBehind,
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
    console.error("Error parsing code behind", e);
    // throw new Error(`Failed to fetch ${response.url}`);
    if (parser.errors.length > 0) {
      return {
        component: errReportScriptError(parser.errors[0], response.url),
        file: response.url,
        hasError: true,
      };
    }
  }

  try {
    // --- Create a module fetcher for resolving imports
    const moduleFetcher: ModuleFetcher = async (modulePath: string) => {
      // --- For URLs (buildless apps), use URL resolution; for file paths, use ModuleResolver
      let resolvedPath: string;
      if (response.url.startsWith("http://") || response.url.startsWith("https://")) {
        // --- URL-based resolution for buildless apps
        const baseUrl = new URL(response.url);
        const moduleName = modulePath.startsWith(".") ? modulePath : `./${modulePath}`;
        try {
          const resolvedUrl = new URL(moduleName, baseUrl);
          resolvedPath = resolvedUrl.toString();
        } catch (e) {
          console.error(
            `[moduleFetcher] Failed to resolve URL: ${modulePath} from ${response.url}`,
            e,
          );
          throw new Error(`Failed to resolve module URL: ${modulePath}`);
        }
      } else {
        // --- File path resolution for other cases
        resolvedPath = ModuleResolver.resolvePath(modulePath, response.url);
      }

      // --- ModuleLoader already resolves the path, so we just need to normalize and fetch it
      // --- Normalize the path for consistency across platforms (especially Windows)
      const normalizedPath = normalizePath(modulePath);

      const moduleResponse = await fetchWithoutCache(normalizedPath);
      if (!moduleResponse.ok) {
        throw new Error(`Failed to fetch module: ${normalizedPath}`);
      }
      return await moduleResponse.text();
    };

    // --- Collect code-behind with import support
    const codeBehind = await collectCodeBehindFromSourceWithImports(
      response.url,
      code,
      moduleFetcher,
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
      src: code,
      codeBehind: codeBehind,
      file: response.url,
    };
  } catch (e) {
    console.error("Error collecting code behind", e);
  }
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
function resolveRuntime(runtime: Record<string, any>): {
  standaloneApp: StandaloneAppDescription;
  projectCompilation?: ProjectCompilation;
  globalVars?: Record<string, any>;
} {
  // --- Collect the components and their sources. We pass the sources to the standalone app
  // --- so that it can be used for error display and debugging purposes.
  const projectCompilation: ProjectCompilation = {
    entrypoint: {
      filename: "",
      definition: null,
      dependencies: new Set(),
    },
    components: [],
    themes: {},
  };
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
        projectCompilation.entrypoint.codeBehindSource = value.default.src;
      } else {
        projectCompilation.entrypoint.filename = key;
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        entryPoint = value.default.component;
        projectCompilation.entrypoint.definition = entryPoint;
        projectCompilation.entrypoint.markupSource = value.default.src;

        // Use key (the actual file path from Vite glob) for consistent source lookups
        sources[key] = value.default.src;
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
        const componentCompilationForCodeBehind = projectCompilation.components.findLast(
          ({ filename }) => {
            // Compare just the base filenames without extensions
            // This handles cases where filename is an absolute path and key is a module specifier
            const getBaseName = (p: string) => {
              const lastSlash = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
              return lastSlash >= 0 ? p.substring(lastSlash + 1) : p;
            };
            const filenameBase = getBaseName(filename);
            const keyBase = getBaseName(key);
            const idxOfCodeBehindFileExtension = keyBase.lastIndexOf(codeBehindFileExtension);
            const idxOfComponentFileExtension = filenameBase.lastIndexOf(componentFileExtension);
            const extensionlessFilenamesMatch =
              filenameBase.substring(0, idxOfComponentFileExtension) ===
              keyBase.substring(0, idxOfCodeBehindFileExtension);

            return extensionlessFilenamesMatch;
          },
        );

        if (componentCompilationForCodeBehind) {
          componentCompilationForCodeBehind.codeBehindSource = value.default.src;
        }
      } else {
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        componentsByFileName[key] = value.default.component;
        sources[key] = value.default.src;

        const componentCompilation: ComponentCompilation = {
          definition: value.default.component,
          // Use key (the actual file path from Vite glob) for consistent source lookups
          filename: key,
          markupSource: value.default.src,
          dependencies: new Set(),
        };
        projectCompilation.components.push(componentCompilation);
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
  } as ComponentDef;

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

  // --- Collect globalVars from compound components and root element
  const compoundGlobals: Record<string, any> = {};
  components.forEach((compound) => {
    if (compound.component?.globalVars) {
      Object.assign(compoundGlobals, compound.component.globalVars);
    }
  });

  // --- Merge with root globals (root takes precedence)
  const mergedGlobals = {
    ...compoundGlobals,
    ...(entryPointWithCodeBehind.globalVars || {}),
  };

  // --- Done.
  return {
    standaloneApp: {
      ...config,
      entryPoint: entryPointWithCodeBehind,
      components,
      themes: config?.themes || themes,
      apiInterceptor: config?.apiInterceptor || apiInterceptor,
      sources,
    },
    projectCompilation,
    globalVars: mergedGlobals,
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

function resolvePath(basePath: string, relativePath: string) {
  // Create a base URL. The 'http://dummy.com' is just a placeholder.
  const baseUrl = new URL(basePath, "http://dummy.com");

  // Create a new URL by resolving the relative path against the base URL.
  const resolvedUrl = new URL(relativePath, baseUrl);

  // Return the pathname, removing the leading slash.
  return resolvedUrl.pathname.substring(1);
}

/**
 * Helper function to load theme files with support for both JSON and YAML formats.
 * First tries to load as JSON, if that fails, attempts to load as YAML.
 * @param url The URL to fetch the theme from
 * @returns A Promise resolving to the parsed theme definition
 */
async function loadThemeFile(url: string): Promise<ThemeDefinition> {
  // First try to load as JSON
  try {
    const response = await fetchWithoutCache(url);
    if (!response.ok) {
      // If the JSON file doesn't exist, try YAML immediately
      throw new Error(`Failed to fetch ${url}`);
    }

    // Get the content as text first
    const text = await response.text();

    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (jsonParseError) {
      // If JSON parsing fails, it might be a YAML file with a .json extension
      // or we need to try the .yml version
      console.warn(`Failed to parse ${url} as JSON, attempting YAML parsing.`);
      try {
        return yaml.load(text) as ThemeDefinition;
      } catch (yamlParseError) {
        // If both JSON and YAML parsing fail for this file, try the .yml version
        throw jsonParseError;
      }
    }
  } catch (jsonError) {
    // If JSON file loading fails, try YAML
    const yamlUrl = url.replace(/\.json$/, ".yml");
    try {
      const response = await fetchWithoutCache(yamlUrl);
      if (!response.ok) throw new Error(`Failed to fetch ${yamlUrl}`);
      const text = await response.text();
      return yaml.load(text) as ThemeDefinition;
    } catch (yamlError) {
      console.error(
        `Failed to load theme file: ${url} (JSON error:`,
        jsonError,
        "YAML error:",
        yamlError,
        ")",
      );
      throw new Error(`Failed to load theme file ${url} in either JSON or YAML format`);
    }
  }
}

/**
 * Fetch the up-to-date state of the source file
 * @param url The URL to fetch the source file from
 * @returns The source file contents response
 */
function fetchWithoutCache(url: string): Promise<Response> {
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
  extensionManager?: StandaloneExtensionManager,
): {
  standaloneApp: StandaloneAppDescription | null;
  projectCompilation?: ProjectCompilation;
  globalVars?: Record<string, any>;
} {
  const [standaloneApp, setStandaloneApp] = useState<StandaloneAppDescription | null>(() => {
    // --- Initialize the standalone app
    const resolvedRuntime = resolveRuntime(runtime);
    const appDef = mergeAppDefWithRuntime(resolvedRuntime.standaloneApp, standaloneAppDef);

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

  const [projectCompilation, setProjectCompilation] = useState<ProjectCompilation>(null);

  // --- This function extracts the global variables and functions from the combined
  // --- pre-built Globals.xs module.
  const extractGlobals = (prebuiltGlobals: Record<string, any>): Record<string, any> => {
    const extractedVars: Record<string, any> = {};
    
    // Process variables in multiple passes to handle dependencies
    // Keep processing until no new variables are resolved (fixed-point iteration)
    const unprocessed = new Map(Object.entries(prebuiltGlobals));
    let progress = true;
    let maxIterations = 100; // Prevent infinite loops
    let iterations = 0;
    
    while (unprocessed.size > 0 && progress && iterations < maxIterations) {
      progress = false;
      iterations++;
      
      for (const [key, value] of Array.from(unprocessed.entries())) {
        // The value is a variable definition object with __PARSED__ and tree
        if (
          typeof value === "object" &&
          value !== null &&
          (value as any).__PARSED__ &&
          (value as any).tree
        ) {
          const tree = (value as any).tree;

          try {
            // Create an evaluation context with previously extracted variables available
            const evalContext: BindingTreeEvaluationContext = {
              mainThread: {
                childThreads: [],
                blocks: [{ vars: { ...extractedVars } }],  // Include previously evaluated globals
                loops: [],
                breakLabelValue: -1,
              },
              localContext: extractedVars,  // Also include in localContext for variable lookup
            };

            // Evaluate the expression tree (handles literals, binary expressions, etc.)
            const evaluatedValue = evalBinding(tree, evalContext);
            extractedVars[key] = evaluatedValue;
            
            // IMPORTANT: Store the original tree to enable re-evaluation on global updates (for reactivity)
            extractedVars[`__tree_${key}`] = tree;
            
            unprocessed.delete(key);
            progress = true;
          } catch (error) {
            // If evaluation fails, skip for now (may be waiting for dependencies)
            // It will be retried in the next iteration if another variable gets resolved
          }
        } else {
          // Literal value, not an expression
          extractedVars[key] = value;
          unprocessed.delete(key);
          progress = true;
        }
      }
    }
    
    // Handle any remaining unprocessed variables (circular dependencies or evaluation errors)
    for (const [key, value] of unprocessed.entries()) {
      if (typeof value === "object" && value !== null && (value as any).tree) {
        try {
          extractedVars[key] = (value as any).tree.value ?? 0;
          // Still store the tree for potential re-evaluation
          extractedVars[`__tree_${key}`] = (value as any).tree;
        } catch {
          extractedVars[key] = 0;
        }
      } else {
        extractedVars[key] = value;
      }
    }
    
    return extractedVars;
  };

  // Helper function to re-evaluate globals when dependencies change
  // This enables reactive updates when a global variable is modified
  // NOTE: Currently, this function is prepared but not automatically called on global state changes.
  // Full reactivity for dependent globals would require integration with the state management system
  // to automatically re-evaluate when a global is modified (e.g., via count++).
  // For now, dependent globals maintain their initially evaluated values.
  const reEvaluateGlobals = (globals: Record<string, any>): Record<string, any> => {
    const result = { ...globals };
    
    // Find all keys with stored expression trees
    const treesMap = new Map<string, any>();
    for (const [key, value] of Object.entries(globals)) {
      if (key.startsWith("__tree_")) {
        const varName = key.substring("__tree_".length);
        if (varName && !varName.startsWith("__")) {  // Avoid re-evaluating metadata
          treesMap.set(varName, value);
        }
      }
    }
    
    // If there are no trees to re-evaluate, return globals as-is
    if (treesMap.size === 0) {
      return result;
    }
    
    // Re-evaluate all variables with trees in dependency order (may need multiple passes)
    let changed = true;
    let iterations = 0;
    const maxIterations = 10;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      for (const [varName, tree] of treesMap.entries()) {
        try {
          const evalContext: BindingTreeEvaluationContext = {
            mainThread: {
              childThreads: [],
              blocks: [{ vars: { ...result } }],  // Use current global values
              loops: [],
              breakLabelValue: -1,
            },
            localContext: result,
          };
          
          const evaluatedValue = evalBinding(tree, evalContext);
          if (result[varName] !== evaluatedValue) {
            result[varName] = evaluatedValue;
            changed = true;  // Something changed, may need another pass for transitive dependencies
          }
        } catch (error) {
          // If re-evaluation fails, keep the current value
          // This handles cases where dependencies aren't yet available
        }
      }
    }
    
    return result;
  };

  const [globalVars, setGlobalVars] = useState<Record<string, any>>(() => {
    // Get the vars in Globals.xs module directly from runtime
    const globalsXs = runtime?.[GLOBALS_BUILT_RESOURCE];
    return extractGlobals({ ...(globalsXs?.vars || {}), ...(globalsXs?.functions || {}) });
  });

  useIsomorphicLayoutEffect(() => {
    void (async function () {
      const resolvedRuntime = resolveRuntime(runtime);
      const appDef = mergeAppDefWithRuntime(resolvedRuntime.standaloneApp, standaloneAppDef);

      // --- In dev mode or when the app is inlined (provided we do not use the standalone mode),
      // --- we must have the app definition available.
      if (
        (process.env.VITE_DEV_MODE || process.env.VITE_BUILD_MODE === "INLINE_ALL") &&
        !process.env.VITE_STANDALONE
      ) {
        if (!appDef) {
          throw new Error("couldn't find the application metadata");
        }
        
        // --- Transform Globals.xs variables into <global> tags for dependency support
        const globalsXs = runtime?.[GLOBALS_BUILT_RESOURCE];
        if (globalsXs?.vars || globalsXs?.functions) {
          console.log("[StandaloneApp] Found Globals.xs content:", {
            vars: Object.keys(globalsXs?.vars || {}),
            functions: Object.keys(globalsXs?.functions || {})
          });
          
          appDef.entryPoint = transformGlobalsXsToGlobalTags(
            appDef.entryPoint as ComponentDef,
            globalsXs
          );
        }
        
        const lintErrorComponent = processAppLinting(appDef, metadataProvider);
        if (lintErrorComponent) {
          appDef.entryPoint = lintErrorComponent;
        }

        discoverCompilationDependencies({
          projectCompilation: resolvedRuntime.projectCompilation,
          extensionManager,
        });
        setProjectCompilation(resolvedRuntime.projectCompilation);
        setStandaloneApp(appDef);
        
        // --- Collect globalVars from the MERGED app definition (not resolved runtime)
        // --- This ensures test components' globalVars are included
        const parsedGlobals: Record<string, any> = {};
        
        // Collect from root element (cast as ComponentDef since entryPoint is always a component definition)
        const entryPointDef = appDef.entryPoint as ComponentDef;
        if (entryPointDef?.globalVars) {
          Object.assign(parsedGlobals, entryPointDef.globalVars);
        }
        
        // Collect from compound components
        appDef.components?.forEach((compound) => {
          if (compound?.component?.globalVars) {
            Object.keys(compound.component.globalVars).forEach((key) => {
              if (!(key in parsedGlobals)) {
                parsedGlobals[key] = compound.component.globalVars[key];
              }
            });
          }
        });
        
        // --- Since Globals.xs variables are now transformed to <global> tags,
        // --- we only need to set the parsed globals from component definitions
        console.log("[StandaloneApp] Setting globalVars from parsed components:", parsedGlobals);
        setGlobalVars(parsedGlobals);
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
          themePromises.push(loadThemeFile(theme));
        });
        const themes = await Promise.all(themePromises);

        const newAppDef = {
          ...appDef,
          name: config.name,
          appGlobals: config.appGlobals,
          defaultTheme: config.defaultTheme,
          resources: config.resources,
          resourceMap: config.resourceMap,
          themes,
        };

        const lintErrorComponent = processAppLinting(newAppDef, metadataProvider);
        if (lintErrorComponent) {
          newAppDef.entryPoint = lintErrorComponent;
        }
        discoverCompilationDependencies({
          projectCompilation: resolvedRuntime.projectCompilation,
          extensionManager,
        });
        setProjectCompilation(resolvedRuntime.projectCompilation);
        setStandaloneApp(newAppDef);
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

      // --- Fetch the optional Globals.xs file containing global variables and functions
      const globalsPromise = new Promise(async (resolve) => {
        try {
          const resp = await fetchWithoutCache(GLOBALS_FILE);
          if (resp.ok) {
            const parsedGlobals = await parseCodeBehindResponse(resp);
            const globalsXs = parsedGlobals?.codeBehind;
            const extractedGlobals = extractGlobals({
              ...(globalsXs?.vars || {}),
              ...(globalsXs?.functions || {}),
            });
            resolve(extractedGlobals);
          } else {
            resolve({
              component: errReportMessage(`Failed to load the globals component (${GLOBALS_FILE})`),
              file: GLOBALS_FILE,
              hasError: true,
            });
          }
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
      let themePromises: Promise<ThemeDefinition>[];
      if ((config?.themes ?? []).length === 0 && config?.defaultTheme) {
        // --- Special case, we have only a single "defaultTheme" in the configuration
        const fetchDefaultTheme = loadThemeFile(`themes/${config?.defaultTheme}.json`);
        themePromises = [fetchDefaultTheme];
      } else {
        // --- In any other case, we fetch all themes defined in the configuration
        themePromises = config?.themes?.map((themePath) => {
          return loadThemeFile(themePath);
        });
      }
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
      const [loadedEntryPoint, loadedGlobals, loadedComponents, themes] = await Promise.all([
        entryPointPromise,
        globalsPromise,
        Promise.all(componentPromises || []),
        Promise.all(themePromises || []),
      ]);

      // --- We will pass these globals
      setGlobalVars(loadedGlobals);

      // --- Collect the elements of the standalone app (and potential errors)
      const errorComponents: ComponentDef[] = [];

      // --- Check if the main component has errors
      if (loadedEntryPoint.hasError) {
        errorComponents.push(loadedEntryPoint!.component as ComponentDef);
      }

      let loadedEntryPointCodeBehind = null;
      if (loadedEntryPoint.component.props?.codeBehind !== undefined) {
        // --- We have a code-behind file for the main component
        loadedEntryPointCodeBehind = (await new Promise(async (resolve) => {
          try {
            const resp = await fetchWithoutCache(
              resolvePath(
                MAIN_FILE,
                loadedEntryPoint.component.props?.codeBehind || MAIN_CODE_BEHIND_FILE,
              ),
            );
            const codeBehind = await parseCodeBehindResponse(resp);
            resolve(codeBehind.hasError ? codeBehind : codeBehind.codeBehind);
          } catch (e) {
            resolve(null);
          }
        })) as any;
        if (loadedEntryPointCodeBehind.hasError) {
          errorComponents.push(loadedEntryPointCodeBehind.component as ComponentDef);
        }
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

        resolvedRuntime.projectCompilation.entrypoint.filename = MAIN_FILE;
        resolvedRuntime.projectCompilation.entrypoint.definition = loadedEntryPoint.component;
        resolvedRuntime.projectCompilation.entrypoint.markupSource = loadedEntryPoint.src;

        if (loadedEntryPointCodeBehind?.src !== undefined) {
          resolvedRuntime.projectCompilation.entrypoint.codeBehindSource =
            loadedEntryPointCodeBehind.src;
        }
      }

      // --- Components may have code-behind files
      loadedComponents.forEach((compWrapper) => {
        if (compWrapper?.file?.endsWith(`.${codeBehindFileExtension}`)) {
          codeBehinds[compWrapper.file] = compWrapper.codeBehind;
        } else {
          if (compWrapper.file) {
            sources[compWrapper.file] = compWrapper.src;
            // resolvedRuntime.projectCompilation.entrypoint.filename = MAIN_FILE;
            // resolvedRuntime.projectCompilation.entrypoint.definition = loadedEntryPoint.component;
            // resolvedRuntime.projectCompilation.entrypoint.markupSource = loadedEntryPoint.src;
          }
        }
      });

      // --- Assemble the runtime for the main app file
      const entryPointWithCodeBehind = {
        ...loadedEntryPoint.component,
        vars: {
          ...loadedEntryPointCodeBehind?.vars,
          ...loadedEntryPoint.component.vars,
          ...loadedEntryPoint.codeBehind?.vars,
        },
        functions: loadedEntryPoint.codeBehind?.functions || loadedEntryPointCodeBehind?.functions,
        scriptError:
          loadedEntryPoint.codeBehind?.moduleErrors || loadedEntryPointCodeBehind?.moduleErrors,
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
          themes.push(await loadThemeFile(`themes/${defaultTheme}.json`));
        }
      }

      // --- Assemble the runtime for the components
      const componentsWithCodeBehinds = loadedComponents
        .filter((compWrapper) => !compWrapper?.file?.endsWith(".xmlui.xs"))
        .map((compWrapper) => {
          const componentCodeBehind = codeBehinds[compWrapper.file + ".xs"];
          const result = {
            ...compWrapper.component,
            component: {
              ...(compWrapper.component as any).component,
              vars: {
                ...(compWrapper.component as any).component.vars,
                ...compWrapper.codeBehind?.vars,
                ...componentCodeBehind?.vars,
              },
              functions: compWrapper.codeBehind?.functions || componentCodeBehind?.functions,
              scriptError:
                compWrapper.codeBehind?.moduleErrors || componentCodeBehind?.moduleErrors,
            },
          };
          return result;
        });

      // --- We may have components that are not in the configuration file.
      // --- We need to load them and their code-behinds. First, we collect
      // --- the components to load.
      let componentsToLoad = collectMissingComponents(
        entryPointWithCodeBehind,
        componentsWithCodeBehinds,
        undefined,
        extensionManager,
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

            // --- Let the promises resolve
            const componentMarkup = await componentPromise;

            // --- Parse the component markup and check for errors
            const compWrapper = await parseComponentMarkupResponse(componentMarkup);
            if (compWrapper.hasError) {
              errorComponents.push(compWrapper.component as ComponentDef);
            }

            sources[compWrapper.file] = compWrapper.src;
            const compCompilation: ComponentCompilation = {
              dependencies: new Set(),
              filename: compWrapper.file,
              markupSource: compWrapper.src,
              definition: compWrapper.component as CompoundComponentDef,
            };

            let componentCodeBehind = null;
            if (
              "codeBehind" in compWrapper.component &&
              compWrapper.component?.codeBehind !== undefined
            ) {
              // --- Promises for the component code-behind files
              componentCodeBehind = (await new Promise(async (resolve) => {
                try {
                  const codeBehind = await fetchWithoutCache(
                    resolvePath(
                      `components/${componentPath}`,
                      (compWrapper.component as CompoundComponentDef)?.codeBehind ||
                        `${componentPath}.${codeBehindFileExtension}`,
                    ),
                  );
                  const codeBehindWrapper = await parseCodeBehindResponse(codeBehind);
                  if (codeBehindWrapper.hasError) {
                    errorComponents.push(codeBehindWrapper.component as ComponentDef);
                  }
                  resolve(
                    codeBehindWrapper.hasError
                      ? (codeBehindWrapper.component as CompoundComponentDef)
                      : codeBehindWrapper,
                  );
                } catch {
                  resolve(null);
                }
              })) as Promise<CompoundComponentDef | ParsedResponse>;

              if (componentCodeBehind && "src" in componentCodeBehind) {
                compCompilation.codeBehindSource = componentCodeBehind.src;
              }
            }

            resolvedRuntime.projectCompilation.components.push(compCompilation);

            const compoundComp = {
              ...compWrapper.component,
              component: {
                ...(compWrapper.component as any).component,
                vars: {
                  ...(compWrapper.component as any).component.vars,
                  ...componentCodeBehind?.codeBehind?.vars,
                },
              },
            };

            if (componentCodeBehind && "codeBehind" in componentCodeBehind) {
              compoundComp.component.functions = componentCodeBehind.codeBehind.functions;
              compoundComp.component.scriptError = componentCodeBehind.codeBehind.moduleErrors;
            }

            return compoundComp;
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
          extensionManager,
        );
      }
      // --- Let's check for errors to display

      const newAppDef = {
        ...config,
        themes,
        sources,
        components: componentsWithCodeBehinds as any,
        entryPoint: entryPointWithCodeBehind,
      };

      const lintErrorComponent = processAppLinting(newAppDef, metadataProvider);

      const errorComponent: ComponentDef | null =
        errorComponents.length > 0
          ? {
              type: "VStack",
              props: { gap: 0, padding: 0 },
              children: errorComponents,
            }
          : null;
      if (errorComponent) {
        if (lintErrorComponent) {
          errorComponent.children!.push(lintErrorComponent);
        }
        newAppDef.entryPoint = errorComponent;
      } else if (lintErrorComponent) {
        newAppDef.entryPoint = lintErrorComponent;
      }

      discoverCompilationDependencies({
        projectCompilation: resolvedRuntime.projectCompilation,
        extensionManager,
      });

      setProjectCompilation(resolvedRuntime.projectCompilation);
      setStandaloneApp(newAppDef);
      
      // --- Collect and merge globalVars from parsed components
      const parsedGlobals: Record<string, any> = {};
      
      // Collect from root element
      if (entryPointWithCodeBehind.globalVars) {
        Object.assign(parsedGlobals, entryPointWithCodeBehind.globalVars);
      }
      
      // Collect from compound components (root precedence already handled in component order)
      componentsWithCodeBehinds.forEach((compound) => {
        if (compound?.component?.globalVars) {
          // Only add if not already in parsedGlobals (maintains root precedence)
          Object.keys(compound.component.globalVars).forEach((key) => {
            if (!(key in parsedGlobals)) {
              parsedGlobals[key] = compound.component.globalVars[key];
            }
          });
        }
      });
      
      // Merge with Globals.xs (Globals.xs takes precedence over parsed)
      const mergedGlobalVars = {
        ...parsedGlobals,
        ...loadedGlobals,
      };
      setGlobalVars(mergedGlobalVars);
    })();
  }, [runtime, standaloneAppDef]);

  return { standaloneApp, projectCompilation, globalVars };
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
  extensionManager?: StandaloneExtensionManager,
) {
  // --- Add the discovered compound components to the registry
  const componentRegistry = new ComponentRegistry(
    { compoundComponents: components },
    extensionManager,
  );

  // --- Check the xmlui markup. This check will find all unloaded components
  const metadataHandler: MetadataHandler = {
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
    componentRegistered: (componentName: string) => {
      return componentRegistry.hasComponent(componentName);
    },
  };
  const result = checkXmlUiMarkup(entryPoint as ComponentDef, components, metadataHandler);

  componentRegistry.destroy();

  // --- Collect all missing components.
  // Omit the components that failed to load and the ones that are not in #app-ns namespace
  const baseSet = new Set(
    result
      .filter((r) => r.code === "M001")
      .map((r) => r.args[0].replace("#app-ns.", ""))
      .filter((comp) => !componentsFailedToLoad.has(comp) && !comp.includes(".")),
  );
  const visitor = (
    compDef: ComponentDef,
    parent: ComponentDef | null | undefined,
    before: boolean,
    continuation: { cancel?: boolean; abort?: boolean },
  ) => {
    if (!compDef.props) return;
    Object.entries(compDef.props).forEach(([propKey, propValue]) => {
      if (!propKey.endsWith("Template")) return;
      if (
        typeof propValue.type === "string" &&
        !metadataHandler.componentRegistered(propValue.type)
      ) {
        baseSet.add(propValue.type);
      }
    });
  };
  visitComponent(entryPoint as ComponentDef, null, visitor, {}, metadataHandler);
  return baseSet;
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

/**
 * Transform Globals.xs variables into globalVars property to leverage
 * the existing dependency system that works correctly for globalVars
 */
function transformGlobalsXsToGlobalTags(
  entryPoint: ComponentDef,
  globalsXs: { vars?: Record<string, any>; functions?: Record<string, any> }
): ComponentDef {
  const globalVars: Record<string, string> = {};
  
  // Process vars from Globals.xs
  if (globalsXs.vars) {
    Object.entries(globalsXs.vars).forEach(([varName, varDef]) => {
      console.log(`[transformGlobalsXs] Processing var ${varName}:`, varDef);
      
      // Use the source text directly from the parsed expression
      let valueExpression = "";
      
      if (typeof varDef === "object" && varDef?.source) {
        // Use the source text preserved by the parser
        valueExpression = varDef.source;
        console.log(`[transformGlobalsXs] Using parsed source for ${varName}: "${valueExpression}"`);
      } else if (typeof varDef === "object" && varDef?.src) {
        // Fallback: extract from source code using regex
        const srcMatch = varDef.src.match(new RegExp(`var\\s+${varName}\\s*=\\s*(.+?)(?:;|$)`, 'm'));
        if (srcMatch) {
          valueExpression = srcMatch[1].trim();
          console.log(`[transformGlobalsXs] Extracted from src for ${varName}: "${valueExpression}"`);
        }
      }
      
      if (!valueExpression) {
        valueExpression = "0"; // Safe fallback
        console.log(`[transformGlobalsXs] Using fallback value for ${varName}: "${valueExpression}"`);
      }
      
      // Wrap in braces if not already wrapped
      if (!valueExpression.startsWith("{")) {
        valueExpression = `{${valueExpression}}`;
      }
      
      // Add to globalVars
      globalVars[varName] = valueExpression;
      console.log(`[transformGlobalsXs] Set globalVar ${varName} = "${valueExpression}"`);
    });
  }
  
  // Process functions from Globals.xs (preserve them as functions, not globalVars)
  const functions = globalsXs.functions || {};
  
  // Add the globalVars and functions to the entry point
  if (Object.keys(globalVars).length > 0 || Object.keys(functions).length > 0) {
    const transformedEntryPoint: ComponentDef = {
      ...entryPoint,
      globalVars: {
        ...entryPoint.globalVars,
        ...globalVars
      },
      functions: {
        ...entryPoint.functions,
        ...functions
      }
    };
    
    console.log(`[transformGlobalsXs] Transformed entry point with globalVars:`, globalVars);
    console.log(`[transformGlobalsXs] Transformed entry point with functions:`, Object.keys(functions));
    return transformedEntryPoint;
  }
  
  return entryPoint;
}

// Note: reconstructExpressionFromTree function removed - now using source text directly from parser

export default StandaloneApp;

function processAppLinting(
  appDef: StandaloneAppDescription,
  metadataProvider: MetadataProvider,
): null | ComponentDef {
  const lintSeverity = getLintSeverity(appDef.appGlobals?.lintSeverity);

  if (lintSeverity !== LintSeverity.Skip) {
    const allComponentLints = lintApp({
      appDef,
      metadataProvider,
    });

    if (allComponentLints.length > 0) {
      if (lintSeverity === LintSeverity.Warning) {
        allComponentLints.forEach(printComponentLints);
      } else if (lintSeverity === LintSeverity.Error) {
        return lintErrorsComponent(allComponentLints);
      }
    }
    return null;
  }
}

function discoverCompilationDependencies({
  projectCompilation: { components, entrypoint },
  extensionManager,
}: {
  projectCompilation: ProjectCompilation;
  extensionManager?: StandaloneExtensionManager;
}) {
  const registry = new ComponentRegistry({}, extensionManager);

  const entrypointDependencies = discoverDirectComponentDependencies(
    entrypoint.definition,
    registry,
  );
  entrypoint.dependencies = entrypointDependencies;

  for (const componentCompilation of components) {
    const compDependencies = discoverDirectComponentDependencies(
      componentCompilation.definition.component,
      registry,
    );
    compDependencies.delete(componentCompilation.definition.name);
    componentCompilation.dependencies = compDependencies;
  }

  registry.destroy();
}

function discoverDirectComponentDependencies(
  entrypoint: ComponentDef,
  registry: ComponentRegistry,
): Set<string> {
  return discoverDirectComponentDependenciesHelp(entrypoint, registry, new Set<string>());
}

function discoverDirectComponentDependenciesHelp(
  component: ComponentDef,
  registry: ComponentRegistry,
  deps: Set<string>,
): Set<string> {
  if (!component) {
    return deps;
  }
  const compName = component.type;
  if (!registry.hasComponent(compName)) {
    deps.add(compName);
  }
  if (!component.children) {
    return deps;
  }

  for (const child of component.children) {
    discoverDirectComponentDependenciesHelp(child, registry, deps);
  }

  return deps;
}
