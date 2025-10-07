import type { CompoundComponentDef } from "../../abstractions/ComponentDefs";
import { xmlUiMarkupToComponent } from "../xmlui-parser";

export function compoundComponentDefFromSource(name: string, componentSource: string): CompoundComponentDef {
  const compoundComponentDef = xmlUiMarkupToComponent(componentSource).component as CompoundComponentDef;
  if (!compoundComponentDef) {
    throw new Error(`Failed to parse ${name} component definition during build.`);
  }
  return compoundComponentDef;
}
