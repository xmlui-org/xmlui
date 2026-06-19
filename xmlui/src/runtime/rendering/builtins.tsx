import React, { useEffect, useState, type ReactNode } from "react";

import { evaluateExpressionOrText, runEvent } from "./bindings";
import type { XmluiBuiltInRenderer } from "./types";
import { useBindingRevision } from "./reactive";
import { createSlotScope, type RenderFragment } from "./components";
import { createRuntimeScope } from "../state";
import {
  flexStyle,
  renderValueOrChildren,
  useBooleanProp,
  useEvaluatedProp,
  useStringProp,
} from "./props";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";

export const builtInRenderers: Record<string, XmluiBuiltInRenderer> = {
  App: ({ context, node, scope }) => context.renderChildren(node.children, scope),
  H1: ({ context, node, scope }) => <h1>{context.renderChildren(node.children, scope)}</h1>,
  Stack: ({ context, node, scope }) => {
    const orientation = useStringProp(node, scope, "orientation", "");
    const direction = orientation === "horizontal" ? "row" : orientation === "vertical" ? "column" : undefined;
    return <div style={flexStyle(direction, node, scope)}>{context.renderChildren(node.children, scope)}</div>;
  },
  HStack: ({ context, node, scope }) => (
    <div style={flexStyle("row", node, scope)}>{context.renderChildren(node.children, scope)}</div>
  ),
  VStack: ({ context, node, scope }) => (
    <div style={flexStyle("column", node, scope)}>{context.renderChildren(node.children, scope)}</div>
  ),
  Text: ({ context, node, scope }) => {
    const value = useEvaluatedProp(node, scope, "value", undefined);
    const variant = useStringProp(node, scope, "variant", "");
    return <span data-variant={variant || undefined}>{renderValueOrChildren(context, node, scope, value)}</span>;
  },
  Button: ({ context, node, scope }) => {
    const label = useEvaluatedProp(node, scope, "label", undefined);
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const content: ReactNode =
      node.children.length > 0
        ? context.renderChildren(node.children, scope)
        : String(label ?? "");
    return (
      <button type="button" disabled={!enabled} onClick={() => void runEvent(node.parsed?.events?.click, scope)}>
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
    const data = useEvaluatedProp(node, scope, "data", undefined);
    const internalItems = useEvaluatedProp(node, scope, "items", undefined);
    const reverse = useBooleanProp(node, scope, "reverse", false);
    const items = Array.isArray(data) ? data : Array.isArray(internalItems) ? internalItems : [];
    const renderedItems = reverse ? [...items].reverse() : items;
    const itemTemplate = templateChildren(node, "itemTemplate") ?? nonPropertyChildren(node.children);
    return (
      <>
        {renderedItems.map((item, index) => {
          const sourceIndex = reverse ? items.length - index - 1 : index;
          const itemScope = createRuntimeScope({
            store: scope.store,
            parent: scope,
            props: scope.props,
            contextValues: {
              $item: item,
              $itemIndex: sourceIndex,
              $isFirst: index === 0,
              $isLast: index === renderedItems.length - 1,
            },
            references: scope.references,
            slots: scope.slots,
            emitEvent: scope.emitEvent,
          });
          return <React.Fragment key={index}>{context.renderChildren(itemTemplate, itemScope)}</React.Fragment>;
        })}
      </>
    );
  },
  TextBox: ({ node, scope }) => {
    const initialValue = useStringProp(node, scope, "initialValue", "");
    const placeholder = useStringProp(node, scope, "placeholder", "");
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const readOnly = useBooleanProp(node, scope, "readOnly", false);
    const [value, setValue] = useState(initialValue);
    useEffect(() => setValue(initialValue), [initialValue]);
    return (
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={!enabled}
        readOnly={readOnly}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          setValue(nextValue);
          void runEvent(node.parsed?.events?.didChange, scope, [nextValue]);
        }}
      />
    );
  },
  Checkbox: ({ context, node, scope }) => {
    const initialValue = useBooleanProp(node, scope, "initialValue", false);
    const label = useEvaluatedProp(node, scope, "label", undefined);
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const readOnly = useBooleanProp(node, scope, "readOnly", false);
    const indeterminate = useBooleanProp(node, scope, "indeterminate", false);
    const [checked, setChecked] = useState(initialValue);
    useEffect(() => setChecked(initialValue), [initialValue]);
    const input = (
      <input
        type="checkbox"
        checked={checked}
        disabled={!enabled}
        readOnly={readOnly}
        aria-checked={indeterminate ? "mixed" : checked}
        onClick={() => void runEvent(node.parsed?.events?.click, scope)}
        onChange={(event) => {
          if (readOnly) {
            event.preventDefault();
            return;
          }
          const nextValue = event.currentTarget.checked;
          setChecked(nextValue);
          void runEvent(node.parsed?.events?.didChange, scope, [nextValue]);
        }}
      />
    );
    const content = label === undefined ? context.renderChildren(node.children, scope) : String(label);
    return <label>{input}{content}</label>;
  },
  Select: ({ context, node, scope }) => {
    const initialValue = useStringProp(node, scope, "initialValue", "");
    const controlledValue = useEvaluatedProp(node, scope, "value", undefined);
    const enabled = useBooleanProp(node, scope, "enabled", true);
    const readOnly = useBooleanProp(node, scope, "readOnly", false);
    const [value, setValue] = useState(initialValue);
    useEffect(() => setValue(initialValue), [initialValue]);
    const effectiveValue = controlledValue === undefined ? value : String(controlledValue ?? "");
    const options = optionDescriptors(node, scope);
    return (
      <select
        value={effectiveValue}
        disabled={!enabled}
        onChange={(event) => {
          if (readOnly) {
            event.preventDefault();
            return;
          }
          const nextValue = event.currentTarget.value;
          setValue(nextValue);
          void runEvent(node.parsed?.events?.didChange, scope, [nextValue]);
        }}
      >
        {options.length > 0
          ? options.map((option, index) => (
              <option key={index} value={option.value} disabled={!option.enabled}>
                {option.label}
              </option>
            ))
          : context.renderChildren(node.children, scope)}
      </select>
    );
  },
  Option: () => null,
};

function templateChildren(node: XmluiElement, name: string): XmluiNode[] | undefined {
  const property = node.children.find(
    (child): child is XmluiElement => child.kind === "element" && child.type === "property" && child.props.name === name,
  );
  return property?.children;
}

function nonPropertyChildren(children: XmluiNode[]): XmluiNode[] {
  return children.filter((child) => !(child.kind === "element" && child.type === "property"));
}

function optionDescriptors(
  node: XmluiElement,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Array<{ value: string; label: string; enabled: boolean }> {
  return node.children.flatMap((child) => {
    if (child.kind !== "element" || child.type !== "Option") {
      return [];
    }
    const value = evaluateExpressionOrText(child.props.value ?? "", child.parsed?.props?.value, scope, `${child.type}:value`);
    const label = Object.prototype.hasOwnProperty.call(child.props, "label")
      ? evaluateExpressionOrText(child.props.label, child.parsed?.props?.label, scope, `${child.type}:label`)
      : child.children.map((optionChild) => optionChild.kind === "text" ? optionChild.value : "").join(" ");
    const enabled = Object.prototype.hasOwnProperty.call(child.props, "enabled")
      ? Boolean(evaluateExpressionOrText(child.props.enabled, child.parsed?.props?.enabled, scope, `${child.type}:enabled`))
      : true;
    return [{ value: String(value ?? label ?? ""), label: String(label ?? value ?? ""), enabled }];
  });
}
