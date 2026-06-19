import type { Key, ReactNode } from "react";

import type { BoundDependency } from "../../compiler/scriptSemantics";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import type { RuntimeScope } from "../state";
import type { XmluiComponentModule } from "../types";

export type RenderContext = {
  components: Record<string, XmluiComponentModule>;
  renderElement(node: XmluiElement, scope: RuntimeScope): ReactNode;
  renderChildren(children: XmluiNode[], scope: RuntimeScope): ReactNode;
};

export type XmluiRendererProps = {
  context: RenderContext;
  node: XmluiElement;
  scope: RuntimeScope;
};

export type XmluiBuiltInRenderer = (props: XmluiRendererProps) => ReactNode;

export type XmluiRenderChild = (node: XmluiNode, scope: RuntimeScope, key?: Key) => ReactNode;

export type RuntimePropDependency = {
  kind: "prop";
  name: string;
};

export type NormalizedRuntimeDependency =
  | {
      kind: "local";
      ownerId: string;
      name: string;
      source: BoundDependency;
    }
  | {
      kind: "global";
      name: string;
      source: BoundDependency;
    }
  | {
      kind: "reference";
      name: string;
      source: BoundDependency;
    }
  | {
      kind: "route";
      name: string;
      source: BoundDependency;
    }
  | (RuntimePropDependency & {
      source: BoundDependency;
    });

export class XmluiRenderError extends Error {
  constructor(message: string, readonly node?: XmluiElement) {
    super(message);
    this.name = "XmluiRenderError";
  }
}
