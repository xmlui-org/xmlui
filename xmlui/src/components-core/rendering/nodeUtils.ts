import type { ComponentDef } from "../../abstractions/ComponentDefs";

export function hasRenderableChildren(children: ComponentDef[]): boolean {
  return !!children?.some((child) => child?.type !== "Slot");  
}