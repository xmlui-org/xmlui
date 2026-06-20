import React, { type ReactNode } from "react";

import type { XmluiNode, XmluiText } from "../../compiler/ir";
import { builtInComponentRenderers } from "../../component-core";
import type { RuntimeScope } from "../state";
import { renderMixedText } from "./bindings";
import { ComponentInstance, ScopedElement } from "./components";
import { ExtensionComponentInstance } from "./extensionComponent";
import { useBindingRevision } from "./reactive";
import type { RenderContext } from "./types";
import { XmluiRenderError } from "./types";

export function createRenderContext(
  components: RenderContext["components"],
  extensionRenderers: RenderContext["extensionRenderers"] = {},
): RenderContext {
  const context: RenderContext = {
    components,
    extensionRenderers,
    renderElement: (node, scope) => renderElement(context, node, scope),
    renderChildren: (children, scope) => renderChildren(context, children, scope),
  };
  return context;
}

export function XmluiNodeRenderer({
  context,
  node,
  scope,
}: {
  context: RenderContext;
  node: XmluiNode;
  scope: RuntimeScope;
}): ReactNode {
  if (node.kind === "text") {
    return <XmluiTextRenderer node={node} scope={scope} />;
  }

  if (Object.keys(node.vars).length > 0 && node.type !== "App") {
    return <ScopedElement context={context} node={node} parentScope={scope} props={scope.props} />;
  }

  return renderElement(context, node, scope);
}

function renderElement(context: RenderContext, node: Extract<XmluiNode, { kind: "element" }>, scope: RuntimeScope) {
  const renderer = builtInComponentRenderers[node.type];
  if (renderer) {
    const BuiltInRenderer = renderer;
    return <BuiltInRenderer context={context} node={node} scope={scope} />;
  }

  const component = context.components[node.type];
  if (component) {
    return <ComponentInstance component={component} context={context} node={node} scope={scope} />;
  }

  const extensionRenderer = context.extensionRenderers[node.type];
  if (extensionRenderer) {
    return <ExtensionComponentInstance renderer={extensionRenderer} context={context} node={node} scope={scope} />;
  }

  throw new XmluiRenderError(`Unknown XMLUI component: ${node.type}`, node);
}

export function renderChildren(context: RenderContext, children: XmluiNode[], scope: RuntimeScope): ReactNode {
  return children.map((child, index) => (
    <React.Fragment key={index}>
      <XmluiNodeRenderer context={context} node={child} scope={scope} />
    </React.Fragment>
  ));
}

function XmluiTextRenderer({ node, scope }: { node: XmluiText; scope: RuntimeScope }) {
  useBindingRevision(node.segments, scope);
  return <>{renderMixedText(node.segments, node.value, scope, `text:${node.range.start}:${node.range.end}`)}</>;
}
