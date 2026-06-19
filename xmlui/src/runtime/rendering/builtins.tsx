import React, { type ReactNode } from "react";

import { evaluateExpressionOrText, runEvent } from "./bindings";
import type { XmluiBuiltInRenderer } from "./types";
import { useBindingRevision } from "./reactive";

export const builtInRenderers: Record<string, XmluiBuiltInRenderer> = {
  App: ({ context, node, scope }) => context.renderChildren(node.children, scope),
  H1: ({ context, node, scope }) => <h1>{context.renderChildren(node.children, scope)}</h1>,
  Text: ({ context, node, scope }) => {
    const valueBinding = node.parsed?.props?.value;
    useBindingRevision(valueBinding, scope);
    const value = node.props.value
      ? evaluateExpressionOrText(node.props.value, valueBinding, scope, `text:${node.type}:value`)
      : undefined;
    return <span>{value === undefined ? context.renderChildren(node.children, scope) : String(value)}</span>;
  },
  Button: ({ context, node, scope }) => {
    const labelBinding = node.parsed?.props?.label;
    useBindingRevision(labelBinding, scope);
    const label = node.props.label
      ? evaluateExpressionOrText(node.props.label, labelBinding, scope, `button:${node.type}:label`)
      : undefined;
    const content: ReactNode =
      node.children.length > 0
        ? context.renderChildren(node.children, scope)
        : String(label ?? "");
    return (
      <button type="button" onClick={() => runEvent(node.parsed?.events?.click, scope)}>
        {content}
      </button>
    );
  },
};
