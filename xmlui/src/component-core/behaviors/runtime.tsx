import type { ReactNode } from "react";

import { evaluateBehaviorCondition } from "./conditions";
import { collectedBehaviors } from "./definitions";
import type { BehaviorAttachContext, BehaviorCondition } from "./types";

export function attachBehaviors(
  context: BehaviorAttachContext,
  node: ReactNode,
): ReactNode {
  return collectedBehaviors.reduce(
    (current, behavior) => context.metadata.excludeBehaviors?.includes(behavior.metadata.name)
      ? current
      : behavior.canAttach(context)
      ? behavior.attach(context, current)
      : current,
    node,
  );
}

export function behaviorPropsForComponent(
  context: Omit<BehaviorAttachContext, "props">,
): Record<string, { name: string }> {
  const props: Record<string, { name: string }> = {};
  for (const behavior of collectedBehaviors) {
    if (context.metadata.excludeBehaviors?.includes(behavior.metadata.name)) {
      continue;
    }
    if (!canAttachByMetadataOnly(context, behavior.metadata.condition)) {
      continue;
    }
    for (const propName of Object.keys(behavior.metadata.props)) {
      props[propName] = { name: propName };
    }
  }
  return props;
}

function canAttachByMetadataOnly(
  context: Omit<BehaviorAttachContext, "props">,
  condition: BehaviorCondition | undefined,
): boolean {
  if (!condition) {
    return true;
  }
  return condition.type === "propEquals" ||
    condition.type === "propContains" ||
    condition.type === "propNotEquals"
    ? true
    : evaluateBehaviorCondition(
      condition,
      context.metadata,
      context.componentName,
    );
}
