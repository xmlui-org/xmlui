import type { ComponentRendererDef } from "./RendererDefs";
import type { CompoundComponentDef } from "./ComponentDefs";
import type { ThemeDefinition } from "./ThemingDefs";

export type ComponentExtension = ComponentRendererDef | CompoundComponentDef;

export interface Extension{
  namespace?: string;
  components?: ComponentExtension[];
  themes?: ThemeDefinition[];
}