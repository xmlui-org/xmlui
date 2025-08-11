import type { CompoundComponentDef, ComponentLike } from "../../abstractions/ComponentDefs";
import type { ThemeDefinition } from "../../abstractions/ThemingDefs";
import type { ApiInterceptorDefinition } from "../interception/abstractions";

// This type describes a standalone app
export type StandaloneAppDescription = {
  // Application name
  name?: string;

  // Application version
  version?: string;

  // The apps entry point; rendering starts here
  entryPoint?: ComponentLike;

  // Optional components used by the app in the entry point
  components?: CompoundComponentDef[];

  // Optional themes used by the app
  themes?: ThemeDefinition[];

  // The ID of the default theme
  defaultTheme?: string;

  // The default tone ("dark" or "light")
  defaultTone?: string;

  // Resource definitions for the app
  resources?: Record<string, string>;

  // Resource map for the app
  resourceMap?: Record<string, string>;
  appGlobals?: Record<string, any>;
  apiInterceptor?: ApiInterceptorDefinition;
  sources?: Record<string, string>;
};

export type StandaloneJsonConfig = {
  name?: string;
  appGlobals?: Record<string, any>;
  entryPoint?: string;
  components?: string[];
  themes?: string[];
  defaultTheme?: string;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  apiInterceptor?: ApiInterceptorDefinition;
};
