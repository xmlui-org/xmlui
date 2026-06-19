import React, { type ReactNode } from "react";

import { evaluateExpressionOrText, runEvent } from "./bindings";
import type { XmluiBuiltInRenderer } from "./types";
import { useBindingRevision } from "./reactive";
import { createSlotScope, type RenderFragment } from "./components";
import { createRuntimeScope } from "../state";

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
      <button type="button" onClick={() => void runEvent(node.parsed?.events?.click, scope)}>
        {content}
      </button>
    );
  },
  Slot: ({ context, node, scope }) => {
    const nameBinding = node.parsed?.props?.name;
    useBindingRevision(nameBinding, scope);
    const name = node.props.name
      ? String(evaluateExpressionOrText(node.props.name, nameBinding, scope, "slot:name"))
      : "default";
    const fragment = scope.slots[name] as RenderFragment | undefined;
    if (!fragment) {
      return <>{context.renderChildren(node.children, scope)}</>;
    }

    const contextValues = Object.fromEntries(
      Object.entries(node.props)
        .filter(([key]) => key !== "name")
        .map(([key, value]) => [
          `$${key}`,
          evaluateExpressionOrText(value, node.parsed?.props?.[key], scope, `slot:${name}:${key}`),
        ]),
    );
    return <>{context.renderChildren(fragment.children, createSlotScope(fragment.scope, contextValues))}</>;
  },
  Items: ({ context, node, scope }) => {
    const dataBinding = node.parsed?.props?.data;
    useBindingRevision(dataBinding, scope);
    const data = node.props.data
      ? evaluateExpressionOrText(node.props.data, dataBinding, scope, `items:${node.type}:data`)
      : [];
    const items = Array.isArray(data) ? data : [];
    return (
      <>
        {items.map((item, index) => {
          const itemScope = createRuntimeScope({
            store: scope.store,
            parent: scope,
            props: scope.props,
            contextValues: {
              $item: item,
              $index: index,
            },
            references: scope.references,
            slots: scope.slots,
            emitEvent: scope.emitEvent,
          });
          return <React.Fragment key={index}>{context.renderChildren(node.children, itemScope)}</React.Fragment>;
        })}
      </>
    );
  },
};
