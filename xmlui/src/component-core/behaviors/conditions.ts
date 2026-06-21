import type { ComponentMetadata } from "../metadata";
import type { BehaviorCondition, BehaviorMetadata } from "./types";

export function canBehaviorAttachToComponent(
  behavior: BehaviorMetadata,
  metadata: ComponentMetadata,
  componentName: string,
): boolean {
  if (metadata.excludeBehaviors?.includes(behavior.name)) {
    return false;
  }
  return behavior.condition
    ? evaluateBehaviorCondition(behavior.condition, metadata, componentName)
    : true;
}

export function evaluateBehaviorCondition(
  condition: BehaviorCondition,
  metadata: ComponentMetadata,
  componentName: string,
): boolean {
  switch (condition.type) {
    case "and":
      return condition.conditions.every((child) =>
        evaluateBehaviorCondition(child, metadata, componentName),
      );
    case "or":
      return condition.conditions.some((child) =>
        evaluateBehaviorCondition(child, metadata, componentName),
      );
    case "not":
      return !evaluateBehaviorCondition(condition.condition, metadata, componentName);
    case "visual":
      return metadata.nonVisual !== true;
    case "nonVisual":
      return metadata.nonVisual === true;
    case "hasProp":
    case "propEquals":
    case "propContains":
      return metadata.props?.[condition.propName] !== undefined;
    case "hasNoProp":
    case "propNotEquals":
      return metadata.props?.[condition.propName] === undefined;
    case "hasEvent":
      return metadata.events?.[condition.eventName] !== undefined;
    case "hasNoEvent":
      return metadata.events?.[condition.eventName] === undefined;
    case "hasApi":
      return metadata.apis?.[condition.apiName] !== undefined;
    case "hasNoApi":
      return metadata.apis?.[condition.apiName] === undefined;
    case "hasContextVar":
      return metadata.contextVars?.[condition.contextVarName] !== undefined;
    case "hasNoContextVar":
      return metadata.contextVars?.[condition.contextVarName] === undefined;
    case "isType":
      return componentName === condition.nodeType;
    case "isNotType":
      return componentName !== condition.nodeType;
    default:
      return false;
  }
}

export function hasTriggeredBehaviorProp(
  behavior: BehaviorMetadata,
  props: Record<string, unknown>,
): boolean {
  return behavior.triggerProps.some((name) => {
    const value = props[name];
    return value !== undefined && value !== null && value !== false && value !== "";
  });
}
