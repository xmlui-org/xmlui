import type { ComponentMetadata as RuntimeComponentMetadata } from "../component-core/metadata/types";

export type ComponentMetadata = RuntimeComponentMetadata;

export type ComponentDef<TMd extends ComponentMetadata = ComponentMetadata> = {
  type: string;
  uid?: string;
  props: Record<string, any>;
  children?: ComponentDef[];
  metadata?: TMd;
  [key: string]: any;
};

export type CompoundComponentDef<TMd extends ComponentMetadata = ComponentMetadata> = ComponentDef<TMd>;
export type DynamicChildComponentDef<TMd extends ComponentMetadata = ComponentMetadata> = ComponentDef<TMd>;
export type ParentRenderContext = Record<string, any>;
export type ThemeValueType = string;
