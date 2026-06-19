import React, { useMemo, type ReactNode } from "react";

import type { XmluiExtensionComponent } from "../../extensions";
import type { XmluiElement } from "../../compiler/ir";
import type { RuntimeScope } from "../state";
import { evaluateProps, runEvent } from "./bindings";
import { useBindingRevision } from "./reactive";
import type { RenderContext } from "./types";

export function ExtensionComponentInstance({
  renderer,
  context,
  node,
  scope,
}: {
  renderer: XmluiExtensionComponent;
  context: RenderContext;
  node: XmluiElement;
  scope: RuntimeScope;
}): ReactNode {
  const propDependencies = Object.values(node.parsed?.props ?? {}).flatMap((parsed) =>
    Array.isArray(parsed)
      ? parsed.flatMap((segment) => (segment.kind === "expression" ? segment.dependencies ?? [] : []))
      : parsed.dependencies ?? [],
  );
  useBindingRevision(propDependencies, scope);
  const props = useMemo(
    () => evaluateProps(node.props, node.parsed?.props, scope),
    [node.props, node.parsed?.props, scope, scope.store.getSnapshot()],
  );
  const events = useMemo(
    () => Object.fromEntries(Object.keys(node.events).map((name) => [
      name,
      (...args: unknown[]) => runEvent(node.parsed?.events?.[name], scope, args),
    ])),
    [node.events, node.parsed?.events, scope],
  );

  return (
    <>
      {renderer({
        props,
        events,
        children: context.renderChildren(node.children, scope),
        node,
        scope,
        context,
      })}
    </>
  );
}

