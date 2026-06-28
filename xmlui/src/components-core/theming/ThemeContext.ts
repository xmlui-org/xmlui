import { useXmluiAppContext } from "../../runtime/appContext";
import { useThemeRuntime } from "../../runtime/rendering/theme";

export function useTheme() {
  const runtime = useThemeRuntime();
  const { appGlobals } = useXmluiAppContext();
  return {
    ...runtime,
    getThemeVar(name: string, fallback?: unknown) {
      return runtime.variables[name] ?? runtime.variables[`--xmlui-${name}`] ?? fallback;
    },
    getResourceUrl(resourceString?: string): string | undefined {
      if (!resourceString) {
        return undefined;
      }
      if (!resourceString.startsWith("resource:")) {
        return resourceString;
      }
      const resourceName = resourceString.slice("resource:".length);
      const resources = appGlobals.resources;
      if (resources && typeof resources === "object" && resourceName in resources) {
        const value = (resources as Record<string, unknown>)[resourceName];
        return typeof value === "string" ? value : undefined;
      }
      return undefined;
    },
  };
}
