import type { ApiInterceptorDefinition } from "../interception/abstractions";
import type { CompoundComponentDef, ComponentLike } from "@abstractions/ComponentDefs";
import type { ThemeDefinition } from "@components-core/theming/abstractions";

// --- This type describes a standalone app
export type StandaloneAppDescription = {
  name?: string;
  version?: string;
  entryPoint?: ComponentLike;
  components?: CompoundComponentDef[];
  themes?: ThemeDefinition[];
  defaultTheme?: string;
  defaultTone?: string;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  globals?: Record<string, any>;
  apiInterceptor?: ApiInterceptorDefinition;
  sources?: Record<string, string>;
};

export type StandaloneJsonConfig = {
  name?: string;
  globals?: Record<string, any>;
  entryPoint?: string;
  components?: string[];
  themes?: string[];
  defaultTheme?: string;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  apiInterceptor?: ApiInterceptorDefinition;
};
