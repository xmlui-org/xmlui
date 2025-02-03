import type { ComponentRendererDef } from "@abstractions/RendererDefs";
import type { CompoundComponentDef } from "@abstractions/ComponentDefs";
import type { ThemeDefinition } from "@components-core/theming/abstractions";

export type ComponentExtension = ComponentRendererDef | CompoundComponentDef;

export interface Extension{
  namespace?: string;
  components?: ComponentExtension[];
  themes?: ThemeDefinition[];
}