import { useComponentThemeClass as useRuntimeComponentThemeClass } from "../../runtime/rendering/theme";
import type { ComponentMetadata } from "../../component-core/metadata";

export function useComponentThemeClass(descriptor: ComponentMetadata) {
  const componentName = inferComponentName(descriptor);
  return useRuntimeComponentThemeClass(
    componentName,
    descriptor,
  ).className;
}

function inferComponentName(descriptor: ComponentMetadata): string {
  const firstDefault = Object.keys(descriptor.defaultThemeVars ?? {})[0];
  const match = firstDefault?.match(/(?:^|-)([A-Z][A-Za-z0-9]*)(?:-|$)/);
  return match?.[1] ?? "";
}
