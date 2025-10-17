import type { ComponentRendererDef, CompoundComponentRendererInfo } from "./RendererDefs";
import type { ThemeDefinition } from "./ThemingDefs";

export type ComponentExtension = ComponentRendererDef | CompoundComponentRendererInfo;

export interface Extension{
  namespace?: string;
  components?: ComponentExtension[];
  themes?: ThemeDefinition[];
}