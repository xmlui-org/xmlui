export type BehaviorMetadata = {
  name: string;
  triggerProps: string[];
  otherProps: string[];
  condition: BehaviorCondition;
}

interface ConditionBase {
  // Node type discriminator
  type: BehaviorCondition["type"];
}

export type BehaviorCondition =
  | AndCondition
  | OrCondition
  | NotCondition
  | hasPropCondition
  | PropEqualsCondition
  | PropContainsCondition
  | PropNotEqualsCondition
  | hasApiCondition
  | hasContextVarCondition
  | hasEventCondition;

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

export interface hasPropCondition extends ConditionBase {
  type: "hasProp";
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

export interface hasApiCondition extends ConditionBase {
  type: "hasApi";
  apiName: string;
}

export interface hasContextVarCondition extends ConditionBase {
  type: "hasContextVar";
  contextVarName: string;
}

