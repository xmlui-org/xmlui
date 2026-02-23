import { ComponentPropertyMetadata } from "../../abstractions/ComponentDefs";

export type BehaviorMetadata = {
  // Comon name of the behavior, used for display and debugging purposes
  name: string;

  // Optional friendly name of the behavior, used for display purposes. 
  // If not provided, the 'name' field will be used.
  friendlyName?: string;

  // Longer description of the behavior, used for display and debugging purposes
  description: string;

  // List of properties that determine if the behavior can attach to a node.
  // If any of these properties are present on the node, the behavior will be considered for attachment.
  triggerProps: string[];

  // List of properties that the behavior will use if attached to a node.
  props: Record<string, ComponentPropertyMetadata>;

  // Condition that determines if the behavior can attach to a particular component.
  condition?: BehaviorCondition;
};

interface ConditionBase {
  // Node type discriminator
  type: BehaviorCondition["type"];
}

export type BehaviorCondition =
  | AndCondition
  | OrCondition
  | NotCondition
  | VisualCondition
  | NonVisualCondition
  | hasPropCondition
  | hasNoPropCondition
  | PropEqualsCondition
  | PropContainsCondition
  | PropNotEqualsCondition
  | hasApiCondition
  | hasNoApiCondition
  | hasContextVarCondition
  | hasNoContextVarCondition
  | hasEventCondition
  | hasNoEventCondition
  | isTypeCondition
  | isNotTypeCondition;

export interface AndCondition extends ConditionBase {
  type: "and";
  conditions: BehaviorCondition[];
}

export interface OrCondition extends ConditionBase {
  type: "or";
  conditions: BehaviorCondition[];
}

export interface NotCondition extends ConditionBase {
  type: "not";
  condition: BehaviorCondition;
}

export interface VisualCondition extends ConditionBase {
  type: "visual";
}

export interface NonVisualCondition extends ConditionBase {
  type: "nonVisual";
}

export interface hasPropCondition extends ConditionBase {
  type: "hasProp";
  propName: string;
}

export interface hasNoPropCondition extends ConditionBase {
  type: "hasNoProp";
  propName: string;
}

export interface PropEqualsCondition extends ConditionBase {
  type: "propEquals";
  propName: string;
}

export interface PropContainsCondition extends ConditionBase {
  type: "propContains";
  propName: string;
}

export interface PropNotEqualsCondition extends ConditionBase {
  type: "propNotEquals";
  propName: string;
}

export interface hasEventCondition extends ConditionBase {
  type: "hasEvent";
  eventName: string;
}

export interface hasNoEventCondition extends ConditionBase {
  type: "hasNoEvent";
  eventName: string;
}

export interface hasApiCondition extends ConditionBase {
  type: "hasApi";
  apiName: string;
}

export interface hasNoApiCondition extends ConditionBase {
  type: "hasNoApi";
  apiName: string;
}

export interface hasContextVarCondition extends ConditionBase {
  type: "hasContextVar";
  contextVarName: string;
}

export interface hasNoContextVarCondition extends ConditionBase {
  type: "hasNoContextVar";
  contextVarName: string;
}

export interface isTypeCondition extends ConditionBase {
  type: "isType";
  nodeType: string;
}

export interface isNotTypeCondition extends ConditionBase {
  type: "isNotType";
  nodeType: string;
}
