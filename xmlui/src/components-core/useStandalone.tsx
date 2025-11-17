import { useState } from "react";
import yaml from "js-yaml";
import type {
  ComponentCompilation,
  ProjectCompilation,
} from "../abstractions/scripting/Compilation";
import type { StandaloneAppDescription, StandaloneJsonConfig } from "./abstractions/standalone";
import type StandaloneExtensionManager from "./StandaloneExtensionManager";
import type {
  ComponentDef,
  ComponentLike,
  CompoundComponentDef,
} from "../abstractions/ComponentDefs";
import { useIsomorphicLayoutEffect } from "./utils/hooks";
import {
  errReportComponent,
  errReportMessage,
  errReportModuleErrors,
  errReportScriptError,
  xmlUiMarkupToComponent,
} from "./xmlui-parser";
import type { ThemeDefinition } from "../abstractions/ThemingDefs";
import {
  getLintSeverity,
  lintApp,
  lintErrorsComponent,
  LintSeverity,
  printComponentLints,
} from "../parsers/xmlui-parser/lint";
import { normalizePath } from "./utils/misc";
import {
  codeBehindFileExtension,
  componentFileExtension,
} from "../parsers/xmlui-parser/fileExtensions";
import { Parser } from "../parsers/scripting/Parser";
import {
  collectCodeBehindFromSource,
  removeCodeBehindTokensFromTree,
} from "../parsers/scripting/code-behind-collect";
import { ComponentRegistry } from "../components/ComponentProvider";
import { checkXmlUiMarkup } from "./markup-check";
import { MetadataProvider } from "../language-server/services/common/metadata-utils";
import type { CollectedDeclarations } from "./script-runner/ScriptingSourceTree";
import { collectedComponentMetadata } from "../components/collectedComponentMetadata";

const MAIN_FILE = "Main." + componentFileExtension;
const MAIN_CODE_BEHIND_FILE = "Main." + codeBehindFileExtension;
const CONFIG_FILE = "config.json";

const metadataProvider = new MetadataProvider(collectedComponentMetadata);
/**
 * Using its definition, this React hook prepares the runtime environment of a
 * standalone app. It runs every time an app source file changes.
 * @param standaloneAppDef The standalone app description
 * @param runtime The pre-compiled runtime environment
 * @returns The prepared StandaloneAppDescription if the collection is
 * successful; otherwise, null.
 */
export function useStandalone(
  standaloneAppDef: StandaloneAppDescription | undefined,
  runtime: Record<string, any> = {},
  extensionManager?: StandaloneExtensionManager,
): { standaloneApp: StandaloneAppDescription | null; projectCompilation?: ProjectCompilation } {
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

  const [projectCompilation, setProjectCompilation] = useState<ProjectCompilation | null>(null);

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

        const projectCompilation = resolvedRuntime.projectCompilation;
        if (!projectCompilation) {
          setStandaloneApp(appDef);
          return;
        }

        // --- In dev mode, try to fetch up-to-date sources
        const promises: Promise<any>[] = [];

        // 1. Handle Entry Point
        if (projectCompilation.entrypoint?.filename) {
          const entryPointBaseName = projectCompilation.entrypoint.filename.substring(
            projectCompilation.entrypoint.filename.lastIndexOf("/") + 1,
          );
          const entryPointPromise = fetchComponentWithCodeBehind(entryPointBaseName, "/xmlui").then(
            ({ component, markupSource, codeBehindSource }) => {
              if (component) {
                appDef.entryPoint = component as ComponentDef;
                projectCompilation.entrypoint.definition = component as ComponentDef;
                projectCompilation.entrypoint.markupSource = markupSource;
                projectCompilation.entrypoint.codeBehindSource = codeBehindSource;
              }
            },
          );
          promises.push(entryPointPromise);
        }

        // 2. Handle Components
        const componentPromises = projectCompilation.components.map(async (compilation) => {
          const componentBaseName = compilation.filename.substring(
            compilation.filename.lastIndexOf("/") + 1,
          );
          const { component, markupSource, codeBehindSource } = await fetchComponentWithCodeBehind(
            componentBaseName,
            "/xmlui",
          );
          if (component) {
            const updatedComponent = component as CompoundComponentDef;
            const index = appDef.components.findIndex((c) => c.name === updatedComponent.name);
            if (index !== -1) {
              appDef.components[index] = updatedComponent;
            }
            compilation.definition = updatedComponent;
            compilation.markupSource = markupSource;
            compilation.codeBehindSource = codeBehindSource;
          }
        });

        promises.push(...componentPromises);
        await Promise.all(promises);

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

      // --- Standalone Mode: Fetch all required files
      const errorComponents: ComponentDef[] = [];
      const sources: Record<string, string> = {};

      // 1. Fetch Entry Point
      const {
        component: loadedEntryPoint,
        markupSource: entryPointMarkup,
        codeBehindSource: entryPointCodeBehind,
        errorComponent: entryPointError,
      } = await fetchComponentWithCodeBehind(MAIN_FILE, ".");

      if (entryPointError) errorComponents.push(entryPointError);
      if (entryPointMarkup) sources[MAIN_FILE] = entryPointMarkup;
      if (loadedEntryPoint) {
        resolvedRuntime.projectCompilation.entrypoint.filename = MAIN_FILE;
        resolvedRuntime.projectCompilation.entrypoint.definition = loadedEntryPoint as ComponentDef;
        resolvedRuntime.projectCompilation.entrypoint.markupSource = entryPointMarkup;
        resolvedRuntime.projectCompilation.entrypoint.codeBehindSource = entryPointCodeBehind;
      }

      // 2. Fetch Config and Themes
      let config: StandaloneJsonConfig | undefined;
      try {
        const configResponse = await fetchWithoutCache(CONFIG_FILE);
        config = await configResponse.json();
      } catch (e) {
        /* config is optional */
      }

      let themePromises: Promise<ThemeDefinition>[] = [];
      if ((config?.themes ?? []).length === 0 && config?.defaultTheme) {
        themePromises = [loadThemeFile(`themes/${config?.defaultTheme}.json`)];
      } else if (config?.themes) {
        themePromises = config.themes.map((themePath) => loadThemeFile(themePath));
      }
      const themes = await Promise.all(themePromises);

      // 3. Fetch components from config
      const codeBehinds: any = {};
      const componentsWithCodeBehinds: (CompoundComponentDef | ComponentDef)[] = [];
      if (config?.components) {
        const componentFetchPromises = config.components.map(async (componentPath) => {
          const value = await fetchWithoutCache(componentPath);
          if (componentPath.endsWith(`.${componentFileExtension}`)) {
            return await parseComponentMarkupResponse(value);
          } else {
            return await parseCodeBehindResponse(value);
          }
        });
        const loadedComponents = await Promise.all(componentFetchPromises);

        loadedComponents.forEach((compWrapper) => {
          if (compWrapper.hasError) {
            errorComponents.push(compWrapper.component as ComponentDef);
          }
          if (compWrapper?.file?.endsWith(`.${codeBehindFileExtension}`)) {
            codeBehinds[compWrapper.file] = compWrapper.codeBehind;
          } else if (compWrapper.file) {
            sources[compWrapper.file] = compWrapper.src;
          }
        });

        const mergedFromConfig = loadedComponents
          .filter((cw) => cw && !cw.file?.endsWith(".xmlui.xs"))
          .map((cw) => {
            const componentCodeBehind = codeBehinds[cw.file + ".xs"];
            const component = cw.component as CompoundComponentDef;
            return {
              ...component,
              component: {
                ...component.component,
                vars: { ...component.component.vars, ...componentCodeBehind?.vars },
                functions: componentCodeBehind?.functions,
                scriptError: componentCodeBehind?.moduleErrors,
              },
            };
          });
        componentsWithCodeBehinds.push(...mergedFromConfig);
      }

      // 4. Dynamically load missing components referenced in markup
      let componentsToLoad = collectMissingComponents(
        loadedEntryPoint,
        componentsWithCodeBehinds,
        undefined,
        extensionManager,
      );
      const componentsFailedToLoad = new Set<string>();

      while (componentsToLoad.size > 0) {
        const componentPromises = [...componentsToLoad].map(async (componentName) => {
          const componentFile = `${componentName}.${componentFileExtension}`;
          const { component, markupSource, codeBehindSource, errorComponent } =
            await fetchComponentWithCodeBehind(componentFile, "components");

          if (errorComponent) {
            errorComponents.push(errorComponent);
          }

          if (component) {
            const filePath = `components/${componentFile}`;
            if (markupSource) sources[filePath] = markupSource;
            const compCompilation: ComponentCompilation = {
              dependencies: new Set(),
              filename: filePath,
              markupSource: markupSource,
              codeBehindSource: codeBehindSource,
              definition: component as CompoundComponentDef,
            };
            resolvedRuntime.projectCompilation.components.push(compCompilation);
            return component;
          } else {
            componentsFailedToLoad.add(componentName);
            return null;
          }
        });

        const newlyLoaded = await Promise.all(componentPromises);
        componentsWithCodeBehinds.push(...newlyLoaded.filter((c) => !!c));
        componentsToLoad = collectMissingComponents(
          loadedEntryPoint,
          componentsWithCodeBehinds,
          componentsFailedToLoad,
          extensionManager,
        );
      }

      // 5. Finalize App Definition
      const newAppDef = {
        ...config,
        themes,
        sources,
        components: componentsWithCodeBehinds as any,
        entryPoint: loadedEntryPoint,
      };

      const lintErrorComponent = processAppLinting(newAppDef, metadataProvider);
      const finalErrorComponent =
        errorComponents.length > 0
          ? { type: "VStack", props: { gap: 0, padding: 0 }, children: errorComponents }
          : null;

      if (finalErrorComponent) {
        if (lintErrorComponent) finalErrorComponent.children!.push(lintErrorComponent);
        newAppDef.entryPoint = finalErrorComponent;
      } else if (lintErrorComponent) {
        newAppDef.entryPoint = lintErrorComponent;
      }

      discoverCompilationDependencies({
        projectCompilation: resolvedRuntime.projectCompilation,
        extensionManager,
      });

      setProjectCompilation(resolvedRuntime.projectCompilation);
      setStandaloneApp(newAppDef);
    })();
  }, [runtime, standaloneAppDef, extensionManager]);
  return { standaloneApp, projectCompilation };
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

  // --- Collect all missing components.
  // Omit the components that failed to load and the ones that are not in #app-ns namespace
  return new Set(
    result
      .filter((r) => r.code === "M001")
      .map((r) => r.args[0].replace("#app-ns.", ""))
      .filter((comp) => !componentsFailedToLoad.has(comp) && !comp.includes(".")),
  );
}

/**
 * Fetches and parses a component markup file and its corresponding code-behind file.
 * @param componentFile The base name of the component file (e.g., "Button.xmlui")
 * @param basePath The path to the folder containing the component file.
 * @returns A promise that resolves to the processed component data.
 */
async function fetchComponentWithCodeBehind(
  componentFile: string,
  basePath: string,
): Promise<{
  component?: ComponentDef | CompoundComponentDef;
  markupSource?: string;
  codeBehindSource?: string;
  errorComponent?: ComponentDef;
}> {
  const errors: ComponentDef[] = [];
  let component: ComponentDef | CompoundComponentDef | undefined;
  let markupSource: string | undefined;
  let codeBehindSource: string | undefined;

  try {
    const markupPath = normalizePath(`${basePath}/${componentFile}`);
    const markupResp = await fetchWithoutCache(markupPath);
    if (!markupResp.ok) {
      throw new Error(`Failed to fetch ${markupResp.url}`);
    }

    const parsedMarkup = await parseComponentMarkupResponse(markupResp);
    if (parsedMarkup.hasError) {
      errors.push(parsedMarkup.component as ComponentDef);
    } else {
      component = parsedMarkup.component;
      markupSource = parsedMarkup.src;
    }

    if (component) {
      const codeBehindFile = componentFile.replace(
        `.${componentFileExtension}`,
        `.${codeBehindFileExtension}`,
      );
      const codeBehindPath = normalizePath(`${basePath}/${codeBehindFile}`);
      try {
        const codeBehindResp = await fetchWithoutCache(codeBehindPath);
        if (codeBehindResp.ok) {
          const parsedCodeBehind = await parseCodeBehindResponse(codeBehindResp);
          if (parsedCodeBehind.hasError) {
            errors.push(parsedCodeBehind.component as ComponentDef);
          } else if (parsedCodeBehind.codeBehind) {
            const target =
              (component as CompoundComponentDef).component || (component as ComponentDef);
            target.vars = { ...target.vars, ...parsedCodeBehind.codeBehind.vars };
            target.functions = parsedCodeBehind.codeBehind.functions;
            target.scriptError = parsedCodeBehind.codeBehind.moduleErrors;
            codeBehindSource = parsedCodeBehind.src;
          }
        }
      } catch (e) {
        // Code-behind is optional, so ignore fetch errors.
      }
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    errors.push(
      errReportMessage(
        `Failed to load component from ${basePath}/${componentFile}: ${errorMessage}`,
      ),
    );
  }

  let errorComponent: ComponentDef | undefined;
  if (errors.length > 0) {
    errorComponent = {
      type: "VStack",
      props: {},
      children: errors,
    };
  }

  return { component, markupSource, codeBehindSource, errorComponent };
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
        if (value.default.file) {
          // TODO: Remove this prop
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
        const componentCompilationForCodeBehind = projectCompilation.components.findLast(
          ({ filename }) => {
            const idxOfCodeBehindFileExtension = key.lastIndexOf(codeBehindFileExtension);
            const idxOfComponentFileExtension = filename.lastIndexOf(componentFileExtension);
            const extensionlessFilenamesMatch =
              filename.substring(0, idxOfComponentFileExtension) ===
              key.substring(0, idxOfCodeBehindFileExtension);

            return extensionlessFilenamesMatch;
          },
        );

        componentCompilationForCodeBehind.codeBehindSource = value.default.src;
      } else {
        // --- "default" contains the component definition, the file index,
        // --- and the source code.
        componentsByFileName[key] = value.default.component;
        sources[value.default.file] = value.default.src;

        const componentCompilation: ComponentCompilation = {
          definition: value.default.component,
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
    standaloneApp: {
      ...config,
      entryPoint: entryPointWithCodeBehind,
      components,
      themes: config?.themes || themes,
      apiInterceptor: config?.apiInterceptor || apiInterceptor,
      sources,
    },
    projectCompilation,
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

// --- Tests if the given path contains the specified folder
function matchesFolder(path: string, folderName: string) {
  return path.includes(`/${folderName}/`);
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
    const codeBehind = collectCodeBehindFromSource("Main", code);
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
