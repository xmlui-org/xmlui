import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import ReactDOM from "react-dom/client";

import toast from "react-hot-toast";
import yaml from "js-yaml";

import type { StandaloneAppDescription, StandaloneJsonConfig } from "./abstractions/standalone";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

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
import type { CollectedDeclarations } from "./script-runner/ScriptingSourceTree";
import { SsgEnvProvider } from "./rendering/SsgEnvContext";
import { clearLocalStorage, getAllLocalStorage } from "./appContext/local-storage-functions";
import { StyleInjectionTargetContext } from "./theming/StyleContext";

const MAIN_FILE = "Main." + componentFileExtension;
const MAIN_CODE_BEHIND_FILE = "Main." + codeBehindFileExtension;
const GLOBALS_FILE = "Globals.xs";
const GLOBALS_XS_BUILT_RESOURCE = "/src/Globals.xs";
const CONFIG_FILE = "config.json";

const metadataProvider = new MetadataProvider(collectedComponentMetadata);

// ---------------------------------------------------------------------------
// Storage escape hatch — runs at module-init time, BEFORE React or the router
// are instantiated. By the time BrowserRouter reads globalThis.location the
// param has already been stripped; HashRouter and MemoryRouter are unaffected.
// Uses globalThis instead of window so this module is safe to import in
// Node.js / SSR environments where window is undefined.
// ---------------------------------------------------------------------------

/**
 * Registers `globalThis.XMLUI_RESET_STORAGE` and `globalThis.XMLUI_GET_STORAGE`
 * console helpers.
 *
 * Called once at module-init time when a browser environment is detected.
 * Extracted into a function so the SSR guard is a single top-level check.
 */
function initStorageGlobals(): void {
  // globalThis.XMLUI_RESET_STORAGE(key?) — callable from the browser console.
  // Clears the matching localStorage entries and reloads the page.
  (globalThis as any).XMLUI_RESET_STORAGE = (key?: string) => {
    clearLocalStorage(key);
    globalThis.location.reload();
  };

  // Diagnostic: globalThis.XMLUI_GET_STORAGE() — returns all current localStorage entries
  // as a plain object (values JSON-parsed where possible).
  (globalThis as any).XMLUI_GET_STORAGE = () => getAllLocalStorage();
}

if (typeof globalThis.window !== "undefined") {
  initStorageGlobals();
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
  srcBase?: string;
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
  helmetContext?: Record<string, unknown>;
  children?: ReactNode;

  // --- When true, the app is rendered as an island (embedded into a host page).
  asIsland?: boolean;
};

/**
 * This React component represents a standalone app that implements a web
 * application with xmlui components. A StandaloneApp instance uses a
 * AppRoot wrapped into an ApiInterceptor.
 *
 * AppRoot is responsible for rendering the app (using an internal
 * representation); ApiInterceptor can emulate some backend functionality
 * running in the browser.
 *
 * Note: base styles (index.scss) are NOT imported here as a side-effect.
 * Instead, the `RootClasses` component (ThemeReact.tsx) injects them as a
 * `<style id="xmlui-base-styles">` tag prepended into the correct target
 * (document.head for normal apps, shadow root for islands). This ensures
 * the @layer declaration always evaluates first — before any Vite-injected
 * component styles — and that island styles are fully scoped to their
 * shadow root without leaking to the host page.
 */
function StandaloneApp({
  srcBase,
  asIsland,
  appDef,
  appGlobals: globals,
  decorateComponentsWithTestId,
  debugEnabled = false,
  runtime,
  extensionManager,
  waitForApiInterceptor = false,
  helmetContext,
  children,
}: StandaloneAppProps) {
  // --- Fetch all files constituting the standalone app, including components,
  // --- themes, and other artifacts. Display the app version numbers in the
  // --- console.
  const { standaloneApp, projectCompilation, globalVars } = useStandalone(
    appDef,
    runtime,
    extensionManager,
    srcBase,
  );
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

  // Helper to filter out internal metadata (__tree_* keys) from globalVars.
  const filterGlobalVars = (vars: Record<string, any>): Record<string, any> => {
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(vars)) {
      if (!key.startsWith("__")) {
        filtered[key] = value;
      }
    }
    return filtered;
  };

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
    icons,
  } = standaloneApp || {};

  const globalProps = useMemo(() => {
    return {
      name: name,
      ...(appGlobals || {}),
      ...(globals || {}),
    };
  }, [appGlobals, globals, name]);

  const themesWithExtensions = useMemo(
    () => [
      ...(themes || []),
      ...(extensionManager?.registeredExtensions?.flatMap((ext) => ext.themes ?? []) ?? []),
    ],
    [themes, extensionManager],
  );

  let contributes = useMemo(() => {
    return {
      compoundComponents: components,
      themes: themesWithExtensions,
    };
  }, [components, themesWithExtensions]);

  if (!standaloneApp) {
    // --- Problems found, the standalone app cannot run
    return null;
  }

  // --- The app may use a mocked API already defined in `globalThis.XMLUI_MOCK_API`
  // --- or within the standalone app's definition, in `apiInterceptor`.
  const mockedApi =
    // @ts-ignore
    typeof globalThis.window !== "undefined" && (globalThis as any).XMLUI_MOCK_API
      ? (globalThis as any).XMLUI_MOCK_API
      : apiInterceptor;

  // --- Components can be decorated with test IDs used in end-to-end tests.
  // --- This flag checks the environment if the app runs in E2E test mode.
  // --- Also enable when xsVerbose is true (for inspector support).
  const shouldDecorateWithTestId =
    decorateComponentsWithTestId ||
    appGlobals?.xsVerbose === true ||
    // @ts-ignore
    (typeof globalThis.window !== "undefined" ? (globalThis as any).XMLUI_MOCK_TEST_ID : false);

  // --- An app can turn off the default hash routing.
  const useHashBasedRouting = appGlobals?.useHashBasedRouting ?? true;

  return (
    <ApiInterceptorProvider
      interceptor={mockedApi}
      useHashBasedRouting={useHashBasedRouting}
      waitForApiInterceptor={waitForApiInterceptor}
    >
      <SsgEnvProvider>
        <AppRoot
          asIsland={asIsland}
          projectCompilation={projectCompilation}
          decorateComponentsWithTestId={shouldDecorateWithTestId}
          node={entryPoint!}
          standalone={true}
          debugEnabled={debugEnabled}
          // @ts-ignore
          routerBaseName={
            typeof globalThis.window !== "undefined" ? (globalThis as any).__PUBLIC_PATH || "" : ""
          }
          globalProps={globalProps}
          globalVars={filterGlobalVars(globalVars)}
          defaultTheme={defaultTheme}
          defaultTone={defaultTone as ThemeTone}
          resources={resources}
          resourceMap={resourceMap}
          sources={sources}
          extensionManager={extensionManager}
          contributes={contributes}
          icons={icons}
          helmetContext={helmetContext}
        >
          {children}
        </AppRoot>
      </SsgEnvProvider>
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
 * Validates that a response is not HTML (which would indicate the server
 * returned index.html instead of the requested file, a common SPA behavior).
 * Returns the response object if valid, or throws an error if it's HTML.
 *
 * Checks:
 * 1. Content-Type header for "text/html"
 * 2. If no Content-Type, checks if text starts with "<!DOCTYPE html>" or "<html"
 *
 * @param response The response to validate
 * @returns The response object if valid
 * @throws If the response is HTML or fetch failed
 */
async function validateResponseIsNotHtml(response: Response): Promise<Response> {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.url}`);
  }

  const contentType = response.headers.get("content-type")?.toLowerCase();
  if (contentType?.includes("text/html")) {
    throw new Error(
      `Failed to fetch ${response.url} - server returned HTML instead of expected content`,
    );
  }

  if (!contentType) {
    const clonedResponse = response.clone();
    const reader = clonedResponse.body?.getReader();

    if (reader) {
      const decoder = new TextDecoder();
      const maxProbeChars = 256;
      let probeText = "";

      try {
        while (probeText.length < maxProbeChars) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          probeText += decoder.decode(value, { stream: true }).toLowerCase();
        }
      } finally {
        reader.releaseLock();
      }

      probeText = probeText.trimStart();
      if (probeText.startsWith("<!doctype html") || probeText.startsWith("<html")) {
        throw new Error(
          `Failed to fetch ${response.url} - server returned HTML instead of expected content`,
        );
      }
    }
  }

  return response;
}

/**
 * This function parses the response of a fetch retrieving the contents of a
 * component markup file.
 * @param response The response coming from the fetch
 * @returns If parsing is successful, it returns the parsed response containing
 * the component definition. Otherwise, it returns a component definition that
 * displays the errors.
 */
async function parseComponentMarkupResponse(response: Response): Promise<ParsedResponse> {
  const validatedResponse = await validateResponseIsNotHtml(response);
  const code = await validatedResponse.text();
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
        const validatedResponse = await validateResponseIsNotHtml(moduleResponse);
        return await validatedResponse.text();
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
  const validatedResponse = await validateResponseIsNotHtml(response);
  const code = await validatedResponse.text();

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
      const validatedResponse = await validateResponseIsNotHtml(moduleResponse);
      return await validatedResponse.text();
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
    const result = {
      src: code,
      codeBehind: codeBehind,
      file: response.url,
    };
    return result;
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
  let globalsXs: CollectedDeclarations | undefined;
  let apiInterceptor: any;

  // --- Process the runtime files
  for (const [key, value] of Object.entries(runtime)) {
    if (matchesFileName(key, "config")) {
      // --- We assume that the config file has a default export and this
      // --- export is the standalone app's configuration.
      config = value.default;
    }

    // --- Globals.xs holds app-wide global variable and function declarations.
    if (key.endsWith("/Globals.xs") && !matchesFolder(key, "components")) {
      globalsXs = value.default;
    }

    // --- We assume that the entry point is either named "Main" or "App".
    if (matchesFileName(key, "Main") || matchesFileName(key, "App")) {
      if (key.endsWith(codeBehindFileExtension)) {
        // --- "default" contains the functions and variables declared in the
        // --- code behind file.
        entryPointCodeBehind = value.default;
        if (value.default?.src) {
          projectCompilation.entrypoint.codeBehindSource = value.default.src;
        }
      } else {
        projectCompilation.entrypoint.filename = key;
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        if (value.default?.component) {
          entryPoint = value.default.component;
          projectCompilation.entrypoint.definition = entryPoint;
        }
        if (value.default?.src) {
          projectCompilation.entrypoint.markupSource = value.default.src;
          // Use key (the actual file path from Vite glob) for consistent source lookups
          sources[key] = value.default.src;
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

        if (componentCompilationForCodeBehind && value.default?.src) {
          componentCompilationForCodeBehind.codeBehindSource = value.default.src;
        }
      } else {
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        if (value.default?.component) {
          componentsByFileName[key] = value.default.component;
        }
        if (value.default?.src) {
          sources[key] = value.default.src;
        }

        const componentCompilation: ComponentCompilation = {
          definition: value.default?.component,
          // Use key (the actual file path from Vite glob) for consistent source lookups
          filename: key,
          markupSource: value.default?.src,
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

  // --- We may have a code-behind file for the entry point (Main.xmlui.xs).
  // --- Its declarations are LOCAL to the Main component.
  let entryPointWithCodeBehind = {
    ...safeEntryPoint,
    vars: {
      ...entryPointCodeBehind?.vars,
      ...safeEntryPoint?.vars,
    },
    functions: entryPointCodeBehind?.functions,
    scriptError: entryPointCodeBehind?.moduleErrors,
  } as ComponentDef;

  // --- Treat Globals.xs variables as globals (same as global.* prefix) so they are
  // --- accessible to child (compound) components.
  if (globalsXs?.vars || globalsXs?.functions) {
    entryPointWithCodeBehind = transformMainXsToGlobalTags(
      entryPointWithCodeBehind,
      globalsXs as any,
    );
  }

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

  // --- Collect globalVars from root element only (components can no longer define globals)
  const mergedGlobals = entryPointWithCodeBehind.globalVars || {};

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
    const validatedResponse = await validateResponseIsNotHtml(response);
    const text = await validatedResponse.text();

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
      const validatedResponse = await validateResponseIsNotHtml(response);
      const text = await validatedResponse.text();
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
  srcBase?: string,
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
  const [pendingLintToasts, setPendingLintToasts] = useState<string[]>([]);

  // --- Show Strict-severity lint warnings after the Toaster (inside NotificationToast)
  // --- has committed. Effects in children fire before parent effects, so by the time
  // --- this fires, NotificationToast has already queued its setShouldRender(true).
  // --- React then processes that state update, mounts the Toaster, and its useState
  // --- initialises from react-hot-toast's module-level memoryState — which already
  // --- contains the toasts fired here.
  useEffect(() => {
    if (pendingLintToasts.length === 0) return;
    const timer = setTimeout(() => {
      pendingLintToasts.forEach((msg) => toast.error(msg, { duration: 8000 }));
    }, 100);
    return () => clearTimeout(timer);
  }, [pendingLintToasts]);

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
                blocks: [{ vars: { ...extractedVars } }], // Include previously evaluated globals
                loops: [],
                breakLabelValue: -1,
              },
              localContext: extractedVars, // Also include in localContext for variable lookup
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
        if (varName && !varName.startsWith("__")) {
          // Avoid re-evaluating metadata
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
              blocks: [{ vars: { ...result } }], // Use current global values
              loops: [],
              breakLabelValue: -1,
            },
            localContext: result,
          };

          const evaluatedValue = evalBinding(tree, evalContext);
          if (result[varName] !== evaluatedValue) {
            result[varName] = evaluatedValue;
            changed = true; // Something changed, may need another pass for transitive dependencies
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
    // Get the vars in Globals.xs module directly from runtime.
    // Normalize: Vite builds export the module under `.default`; test fixtures expose vars at top level.
    const globalsXs = runtime?.[GLOBALS_XS_BUILT_RESOURCE];
    const globalsXsData = (globalsXs as any)?.default ?? globalsXs;
    const extracted = extractGlobals({
      ...(globalsXsData?.vars || {}),
      ...(globalsXsData?.functions || {}),
    });

    // Also include markup globals (global.* attributes) and entry-point functions
    // from the app definition so they are available on the very first render.
    // Without this, child components' onInit handlers fire before globals are in scope.
    const resolvedRuntime = resolveRuntime(runtime);
    const appDef = mergeAppDefWithRuntime(resolvedRuntime.standaloneApp, standaloneAppDef);
    if (appDef?.entryPoint) {
      const ep = appDef.entryPoint as ComponentDef;
      if (ep.globalVars) {
        Object.assign(extracted, ep.globalVars);
      }
      if (ep.functions) {
        Object.assign(extracted, ep.functions);
      }
    }

    return extracted;
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

        // --- Transform Globals.xs variables into <global> tags for dependency support.
        // Normalize: Vite builds export the module under `.default`; test fixtures expose vars at top level.
        const globalsXs = runtime?.[GLOBALS_XS_BUILT_RESOURCE];
        const globalsXsData = (globalsXs as any)?.default ?? globalsXs;
        if (globalsXsData?.vars || globalsXsData?.functions) {
          appDef.entryPoint = transformMainXsToGlobalTags(
            appDef.entryPoint as ComponentDef,
            globalsXsData,
          );
        }

        const { errorComponent: lintErrorComponent, toastMessages } = processAppLinting(
          appDef,
          metadataProvider,
        );
        if (lintErrorComponent) {
          appDef.entryPoint = lintErrorComponent;
        }
        setPendingLintToasts(toastMessages);

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

        // Collect functions from root element (from Globals.xs)
        // Functions need to flow through globalVars to be available in compound components
        if (entryPointDef?.functions) {
          Object.assign(parsedGlobals, entryPointDef.functions);
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

        // Merge extension-provided global functions (app/component globals take precedence)
        extensionManager?.registeredExtensions?.forEach((ext) => {
          if (ext.functions) {
            Object.keys(ext.functions).forEach((key) => {
              if (!(key in parsedGlobals)) {
                parsedGlobals[key] = ext.functions![key];
              }
            });
          }
        });

        // --- Since Globals.xs variables are now transformed to <global> tags,
        // --- we only need to set the parsed globals from component definitions
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
        await validateResponseIsNotHtml(configResponse); // Validate response is not HTML
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

        const { errorComponent: lintErrorComponent, toastMessages } = processAppLinting(
          newAppDef,
          metadataProvider,
        );
        if (lintErrorComponent) {
          newAppDef.entryPoint = lintErrorComponent;
        }
        discoverCompilationDependencies({
          projectCompilation: resolvedRuntime.projectCompilation,
          extensionManager,
        });
        setProjectCompilation(resolvedRuntime.projectCompilation);
        setStandaloneApp(newAppDef);
        setPendingLintToasts(toastMessages);
        return;
      }

      // --- Fetch the main file
      const entryPointPromise = new Promise(async (resolve) => {
        try {
          const resp = await fetchWithoutCache(srcBase + "/" + MAIN_FILE);
          resolve(parseComponentMarkupResponse(resp));
        } catch (e) {
          resolve({
            component: errReportMessage(`Failed to load the main component (${MAIN_FILE})`),
            file: MAIN_FILE,
            hasError: true,
          });
        }
      }) as any;

      // --- Fetch the optional Globals.xs file containing global variables and functions
      const globalsPromise = new Promise(async (resolve) => {
        try {
          const resp = await fetchWithoutCache(GLOBALS_FILE);
          const parsedGlobals = await parseCodeBehindResponse(resp);

          const globalsXs = parsedGlobals?.codeBehind;
          const extractedGlobals = extractGlobals({
            ...globalsXs?.vars,
            ...globalsXs?.functions,
          });
          // Return structure matching vite-xmlui-plugin: codeBehind spread with src and extractedGlobals
          resolve({
            ...parsedGlobals?.codeBehind,
            src: parsedGlobals?.src,
            __extractedGlobals: extractedGlobals,
          });
        } catch (e) {
          // Globals.xs is optional — resolve with null if not found
          resolve(null);
        }
      }) as any;

      // --- Fetch the configuration file (we do not check whether the content is semantically valid)
      let config: StandaloneJsonConfig = undefined;
      try {
        const configResponse = await fetchWithoutCache(CONFIG_FILE);
        await validateResponseIsNotHtml(configResponse); // Validate response is not HTML
        config = await configResponse.json();
      } catch (e) {}

      // --- Fetch the themes according to the configuration
      let themePromises: Promise<ThemeDefinition>[];
      let defaultThemeIsUrl: boolean = false;
      if ((config?.themes ?? []).length === 0 && config?.defaultTheme) {
        // --- Special case, we have only a single "defaultTheme" in the configuration
        const themeUrl = toThemeUrl(config.defaultTheme);
        defaultThemeIsUrl = themeUrl === config.defaultTheme;
        const fetchDefaultTheme = loadThemeFile(themeUrl);
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

      // Note: setGlobalVars is called later after merging with parsedGlobals from components

      // --- Collect the elements of the standalone app (and potential errors)
      const errorComponents: ComponentDef[] = [];

      // --- Check if the main component has errors
      if (loadedEntryPoint.hasError) {
        errorComponents.push(loadedEntryPoint!.component as ComponentDef);
      }

      let loadedEntryPointCodeBehind = null;
      if (loadedEntryPoint.component.props?.codeBehind !== undefined) {
        // --- We have an explicit code-behind file for the main component
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
        if (loadedEntryPointCodeBehind?.hasError) {
          errorComponents.push(loadedEntryPointCodeBehind.component as ComponentDef);
        }
      } else {
        // --- Try to load the convention-based Main.xmlui.xs code-behind file.
        // --- Its declarations are LOCAL to the Main component.
        loadedEntryPointCodeBehind = await (async () => {
          try {
            const resp = await fetchWithoutCache(MAIN_CODE_BEHIND_FILE);
            const parsed = await parseCodeBehindResponse(resp);
            if (parsed.hasError) {
              errorComponents.push(parsed.component as ComponentDef);
              return parsed;
            }
            // Attach src so compilation tracking picks it up
            return { ...parsed.codeBehind, src: parsed.src };
          } catch (e) {
            // Main.xmlui.xs is optional — ignore fetch failures
          }
          return null;
        })();
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
      let entryPointWithCodeBehind: ComponentDef = {
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

      // --- Transform Globals.xs variables into <global> tags for dependency support (same as pre-built path)
      if (
        loadedGlobals &&
        typeof loadedGlobals === "object" &&
        ((loadedGlobals as any).vars || (loadedGlobals as any).functions)
      ) {
        // Pass loadedGlobals directly - it has the same structure as runtime[GLOBALS_XS_BUILT_RESOURCE]
        entryPointWithCodeBehind = transformMainXsToGlobalTags(
          entryPointWithCodeBehind,
          loadedGlobals as any,
        );
      }

      const defaultThemeProp = (entryPointWithCodeBehind as ComponentDef).props?.defaultTheme;
      // --- We test whether the default theme is not from a binding
      // --- expression and is not a built-in theme already loaded. If so,
      // --- we load it from the `themes` folder.
      if (
        defaultThemeProp &&
        typeof defaultThemeProp === "string" &&
        !defaultThemeProp.includes("{")
      ) {
        if (
          !builtInThemes.find((theme) => theme.id === defaultThemeProp) &&
          !themes.find((theme) => theme.id === defaultThemeProp)
        ) {
          defaultThemeIsUrl = defaultThemeProp === config.defaultTheme;
          const themeUrl = toThemeUrl(defaultThemeProp);
          themes.push(await loadThemeFile(themeUrl));
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

      let defaultTheme = config.defaultTheme;
      if (defaultThemeIsUrl) {
        const themeId = themes.at(-1)?.id;
        if (typeof themeId === "string") {
          defaultTheme = themeId;
        }
      }

      const newAppDef = {
        ...config,
        defaultTheme,
        themes,
        sources,
        components: componentsWithCodeBehinds as any,
        entryPoint: entryPointWithCodeBehind,
      };

      const { errorComponent: lintErrorComponent, toastMessages } = processAppLinting(
        newAppDef,
        metadataProvider,
      );

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
      setPendingLintToasts(toastMessages);

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

      // Merge extension-provided global functions (app/component globals take precedence)
      extensionManager?.registeredExtensions?.forEach((ext) => {
        if (ext.functions) {
          Object.keys(ext.functions).forEach((key) => {
            if (!(key in parsedGlobals)) {
              parsedGlobals[key] = ext.functions![key];
            }
          });
        }
      });

      // Set globalVars with expressions from parsedGlobals (same as pre-built path)
      // DO NOT merge with extractedMainXsGlobals - those are static evaluated values that break reactivity
      setGlobalVars(parsedGlobals);
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
    if (rootElement.innerHTML.trim().length > 0) {
      contentRoot = ReactDOM.hydrateRoot(
        rootElement,
        <StandaloneApp runtime={runtime} extensionManager={extensionManager} />,
      );
      return contentRoot;
    }
    contentRoot = ReactDOM.createRoot(rootElement);
  }
  contentRoot.render(<StandaloneApp runtime={runtime} extensionManager={extensionManager} />);
  return contentRoot;
}


export function startIslands(
  extensionManager: StandaloneExtensionManager = new StandaloneExtensionManager(),
): () => void {
  const roots: ReturnType<typeof ReactDOM.createRoot>[] = [];

  document.querySelectorAll("[data-xmlui-src]").forEach((el) => {
    const srcBase = el.getAttribute("data-xmlui-src");
    // Create shadow DOM eagerly so ALL styles (including from the outer
    // React tree) are scoped from the very first render.  This prevents
    // any style leakage to the host page — even if future changes add
    // styled components to the provider layers above NestedApp.
    const shadowRoot = (el as HTMLElement).attachShadow({ mode: "open" });
    const root = ReactDOM.createRoot(shadowRoot);
    roots.push(root);
    root.render(
      <StyleInjectionTargetContext.Provider value={shadowRoot}>
        <StandaloneApp extensionManager={extensionManager} srcBase={srcBase} asIsland={true}/>
      </StyleInjectionTargetContext.Provider>
    );
  });

  return () => {
    roots.forEach((root) => root.unmount());
  };
}


/**
 * Transform Globals.xs variables into globalVars property to leverage
 * the existing dependency system that works correctly for globalVars
 */
function transformMainXsToGlobalTags(
  entryPoint: ComponentDef,
  globalsXsDef: { vars?: Record<string, any>; functions?: Record<string, any>; src?: string },
): ComponentDef {
  const globalVars: Record<string, any> = {};

  // Process vars from Globals.xs
  if (globalsXsDef.vars) {
    Object.entries(globalsXsDef.vars).forEach(([varName, varDef]) => {
      // If the var has a parsed expression tree with source text, convert it
      // to a binding expression string so useGlobalVariables can evaluate it
      // reactively. This preserves reactivity for dependent vars (e.g.,
      // var dummy = 3*count) and correctly handles multi-line expressions
      // (e.g., object literals spanning multiple lines).
      if (
        typeof varDef === "object" &&
        varDef !== null &&
        (varDef as any).__PARSED__ &&
        (varDef as any).tree
      ) {
        const source = (varDef as any).tree.source;
        if (typeof source === "string") {
          // Wrap in {…} so extractParam recognizes it as a binding expression
          globalVars[varName] = "{" + source + "}";
          return;
        }
      }

      // Fallback for vars without a parse tree (e.g., already-evaluated values)
      globalVars[varName] = varDef;
    });
  }

  // Process functions from Globals.xs
  // Functions are parse trees that need to be evaluated to become callable
  const functions: Record<string, any> = {};
  if (globalsXsDef.functions) {
    Object.entries(globalsXsDef.functions).forEach(([funcName, funcDef]) => {
      // Functions come as objects with __PARSED__ mark and tree property
      if (
        typeof funcDef === "object" &&
        funcDef !== null &&
        (funcDef as any).__PARSED__ &&
        (funcDef as any).tree
      ) {
        try {
          const evalContext: BindingTreeEvaluationContext = {
            mainThread: {
              childThreads: [],
              blocks: [{ vars: {} }],
              loops: [],
              breakLabelValue: -1,
            },
            localContext: {},
          };
          const evaluatedFunc = evalBinding((funcDef as any).tree, evalContext);
          functions[funcName] = evaluatedFunc;
        } catch (error) {
          console.error(`Failed to evaluate function ${funcName}:`, error);
        }
      } else {
        functions[funcName] = funcDef;
      }
    });
  }

  // Merge globalVars: .xs vars come FIRST (for evaluation order — markup globals
  // like global.catColors="{categoryColorMap}" can depend on .xs vars), and .xs
  // vars take PRECEDENCE over markup globals with the same name.
  if (Object.keys(globalVars).length > 0 || Object.keys(functions).length > 0) {
    const mergedGlobalVars: Record<string, any> = { ...globalVars };
    if (entryPoint.globalVars) {
      for (const [key, value] of Object.entries(entryPoint.globalVars)) {
        if (!(key in globalVars)) {
          mergedGlobalVars[key] = value;
        }
      }
    }

    const transformedEntryPoint: ComponentDef = {
      ...entryPoint,
      globalVars: mergedGlobalVars,
      functions: {
        ...entryPoint.functions,
        ...functions,
      },
    };

    return transformedEntryPoint;
  }

  return entryPoint;
}

// Note: reconstructExpressionFromTree function removed - now using source text directly from parser

export default StandaloneApp;

function processAppLinting(
  appDef: StandaloneAppDescription,
  metadataProvider: MetadataProvider,
): { errorComponent: ComponentDef | null; toastMessages: string[] } {
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
        return { errorComponent: lintErrorsComponent(allComponentLints), toastMessages: [] };
      } else if (lintSeverity === LintSeverity.Strict) {
        allComponentLints.forEach(printComponentLints);
        const toastMessages = allComponentLints.map(({ componentName, lints }) => {
          const messages = lints.map(({ message }) => message).join("\n");
          return `Lint issues in '${componentName}':\n${messages}`;
        });
        return { errorComponent: null, toastMessages };
      }
    }
  }
  return { errorComponent: null, toastMessages: [] };
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

function toThemeUrl(themeNameOrUrl: string): string {
  const startsWithHttp = /^https?:\/\//;
  if (startsWithHttp.test(themeNameOrUrl)) {
    return themeNameOrUrl;
  }
  let res = "themes/" + themeNameOrUrl;
  if (!themeNameOrUrl.endsWith(".json")) {
    res += ".json";
  }
  return res;
}
