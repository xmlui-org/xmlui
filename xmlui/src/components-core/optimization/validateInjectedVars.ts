import type { ComponentMetadata } from "../../abstractions/ComponentDefs";

// Standard event-payload names that XMLUI injects for every event. These are
// not injected via contextVars / childInjectedVars, so they must be excluded
// from the mismatch check. Extend this set when new universal event keys are added.
export const EVENT_PAYLOAD_RESERVED_NAMES = new Set([
  "$event", "$value", "$oldValue", "$newValue",
]);

export function validateInjectedVars(
  componentType: string,
  metadata: ComponentMetadata | undefined,
  contextVars: Record<string, any> | undefined,
  eventName?: string
) {
  if (!contextVars || !metadata) return;

  // We only care about variables injected starting with $
  const injectedKeys = Object.keys(contextVars).filter(
    k => k.startsWith("$") && !EVENT_PAYLOAD_RESERVED_NAMES.has(k)
  );
  if (injectedKeys.length === 0) return;

  const declaredVars = new Set<string>();

  if (eventName) {
    if (metadata.events?.[eventName]?.injectedVars) {
      metadata.events[eventName].injectedVars!.forEach(v => declaredVars.add(v));
    }
  }

  // Also universally include childInjectedVars and contextVars metadata since
  // our optimizer merges them for both events and templates.
  if (metadata.childInjectedVars) {
    metadata.childInjectedVars.forEach(v => declaredVars.add(v));
  }
  if (metadata.contextVars) {
    Object.keys(metadata.contextVars).forEach(v => declaredVars.add(v));
  }

  const missing = injectedKeys.filter(k => !declaredVars.has(k));
  if (missing.length > 0) {
    const target = eventName ? `events["${eventName}"].injectedVars` : "childInjectedVars";

    const message = `[XMLUI Lexical Scoping] Component ${componentType} injected variables (${missing.join(
      ", "
    )}) into its ${eventName ? "event" : "template"}, but they are NOT declared in its ${target} metadata. ` +
    `This will cause the variables to be stripped during AST optimization. Please update OPTIMIZER_METADATA.${componentType} in xmlui/src/components-core/optimization/optimizer-metadata.ts.`;

    if (import.meta.env?.DEV) {
      throw new Error(message);
    } else {
      console.error(message);
    }
  }
}
