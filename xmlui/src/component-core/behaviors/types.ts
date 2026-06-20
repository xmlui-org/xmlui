import type { ReactNode } from "react";

import type {
  ComponentMetadata,
  ComponentPropertyMetadata,
} from "../metadata";

export type BehaviorCondition =
  | { type: "and"; conditions: BehaviorCondition[] }
  | { type: "or"; conditions: BehaviorCondition[] }
  | { type: "not"; condition: BehaviorCondition }
  | { type: "visual" }
  | { type: "nonVisual" }
  | { type: "hasProp"; propName: string }
  | { type: "hasNoProp"; propName: string }
  | { type: "propEquals"; propName: string }
  | { type: "propContains"; propName: string }
  | { type: "propNotEquals"; propName: string }
  | { type: "hasEvent"; eventName: string }
  | { type: "hasNoEvent"; eventName: string }
  | { type: "hasApi"; apiName: string }
  | { type: "hasNoApi"; apiName: string }
  | { type: "hasContextVar"; contextVarName: string }
  | { type: "hasNoContextVar"; contextVarName: string }
  | { type: "isType"; nodeType: string }
  | { type: "isNotType"; nodeType: string };

export type BehaviorMetadata = {
  name: string;
  friendlyName?: string;
  description: string;
  triggerProps: string[];
  props: Record<string, ComponentPropertyMetadata>;
  condition?: BehaviorCondition;
};

export type BehaviorAttachContext = {
  componentName: string;
  metadata: ComponentMetadata;
  props: Record<string, unknown>;
};

export type Behavior = {
  metadata: BehaviorMetadata;
  canAttach: (context: BehaviorAttachContext) => boolean;
  attach: (context: BehaviorAttachContext, node: ReactNode) => ReactNode;
};
