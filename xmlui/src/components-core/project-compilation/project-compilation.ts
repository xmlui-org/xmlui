import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { ComponentRegistry } from "../../components/ComponentProvider";

export function discoverDirectComponentDependencies(
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
