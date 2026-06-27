import { createSlotScope, type RenderFragment } from "../../runtime/rendering/components";
import { dependenciesForBinding, evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const slotRenderer: XmluiBuiltInRenderer = ({ context, node, scope }) => {
  const nameBinding = node.parsed?.props?.name;
  useBindingRevision(nameBinding, scope);
  useBindingRevision(
    Object.entries(node.parsed?.props ?? {})
      .filter(([key]) => key !== "name")
      .flatMap(([, binding]) => dependenciesForBinding(binding)),
    scope,
  );
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
};
