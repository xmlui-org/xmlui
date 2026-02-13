import type { BehaviorMetadata, BehaviorCondition } from "./BehavorMetadata";
import type { ComponentMetadataProvider } from "../../language-server/services/common/metadata-utils";

/**
 * Determines if a behavior can be attached to a specific component type based on the
 * behavior's metadata condition.
 *
 * @param behaviorMd - The behavior metadata containing the condition to evaluate
 * @param compMdProvider - The component metadata provider for accessing component properties, events, APIs, etc.
 * @param compType - The component type name (e.g., "Button", "TextBox", "Stack")
 * @returns true if the behavior can be attached to the component, false otherwise
 */
export function canBehaviorAttachToComponent(
  behaviorMd: BehaviorMetadata,
  compMdProvider: ComponentMetadataProvider,
  compType: string,
): boolean {
  // If no condition is defined, the behavior can attach to any component
  if (!behaviorMd.condition) {
    return true;
  }

  return evaluateCondition(behaviorMd.condition, compMdProvider, compType);
}

/**
 * Recursively evaluates a behavior condition against a component's metadata.
 *
 * @param condition - The condition to evaluate
 * @param compMdProvider - The component metadata provider
 * @param compType - The component type name
 * @returns true if the condition is satisfied, false otherwise
 */
function evaluateCondition(
  condition: BehaviorCondition,
  compMdProvider: ComponentMetadataProvider,
  compType: string,
): boolean {
  switch (condition.type) {
    // Logical operators
    case "and":
      return condition.conditions.every((c) => evaluateCondition(c, compMdProvider, compType));

    case "or":
      return condition.conditions.some((c) => evaluateCondition(c, compMdProvider, compType));

    case "not":
      return !evaluateCondition(condition.condition, compMdProvider, compType);

    // Component type checks
    case "visual": {
      const metadata = compMdProvider.getMetadata();
      return !metadata.nonVisual;
    }

    case "nonVisual": {
      const metadata = compMdProvider.getMetadata();
      return !!metadata.nonVisual;
    }

    case "isType":
      return compType === condition.nodeType;

    case "isNotType":
      return compType !== condition.nodeType;

    // Property checks
    case "hasProp":
      return !!compMdProvider.getProp(condition.propName);

    case "hasNoProp":
      return !compMdProvider.getProp(condition.propName);

    case "propEquals":
      // Note: This checks if the property exists in metadata
      // The actual value comparison would happen at runtime
      return !!compMdProvider.getProp(condition.propName);

    case "propContains":
      // Similar to propEquals - checks property existence in metadata
      return !!compMdProvider.getProp(condition.propName);

    case "propNotEquals":
      // Checks if property does NOT exist in metadata
      return !compMdProvider.getProp(condition.propName);

    // Event checks
    case "hasEvent":
      return !!compMdProvider.getEvent(condition.eventName);

    case "hasNoEvent":
      return !compMdProvider.getEvent(condition.eventName);

    // API checks
    case "hasApi":
      return !!compMdProvider.getApi(condition.apiName);

    case "hasNoApi":
      return !compMdProvider.getApi(condition.apiName);

    // Context variable checks
    case "hasContextVar":
      return !!compMdProvider.contextVars?.[condition.contextVarName];

    case "hasNoContextVar":
      return !compMdProvider.contextVars?.[condition.contextVarName];

    default:
      // Unknown condition type - default to false for safety
      return false;
  }
}
