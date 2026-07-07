import type { ComponentDef } from "../../abstractions/ComponentDefs";

export type ContainerWrapperDef = {
  type: string;
  props?: Record<string, unknown>;
  contextVars?: Record<string, unknown>;
  children?: ComponentDef[];
};
