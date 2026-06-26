import type { CSSProperties, ReactNode } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { createSlotScope } from "../../runtime/rendering/components";
import { nonPropertyChildren, templateChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./ModalDialog.defaults";
import { ModalDialogMd } from "./ModalDialog";
import { ModalDialogComponent } from "./ModalDialogReact";

const COMP = "ModalDialog";

export const modalDialogRenderer = wrapComponent({
  name: COMP,
  metadata: ModalDialogMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const hasTitleTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "titleTemplate",
    );
    const titleProp = adapter.node.props.title;
    const title = hasTitleTemplate
      ? (params: unknown[]) => adapter.context.renderChildren(
        templateChildren(adapter.node, "titleTemplate") ?? [],
        createSlotScope(adapter.scope, {
          $param: params[0],
          $params: params,
        }),
      )
      : titleProp === undefined
        ? undefined
        : (params: unknown[]) => evaluateExpressionOrText(
          titleProp,
          adapter.node.parsed?.props?.title,
          createSlotScope(adapter.scope, {
            $param: params[0],
            $params: params,
          }),
          "ModalDialog:title",
        ) as ReactNode;
    const children = modalContentChildren(adapter.node);

    return (
      <ModalDialogComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        fullScreen={adapter.booleanProp("fullScreen", defaultProps.fullScreen)}
        initiallyOpen={Object.prototype.hasOwnProperty.call(adapter.props, "when")}
        closeButtonVisible={adapter.booleanProp("closeButtonVisible", defaultProps.closeButtonVisible)}
        title={title}
        tooltip={adapter.stringProp("tooltip")}
        tooltipMarkdown={adapter.stringProp("tooltipMarkdown")}
        onOpen={(...params) => { void adapter.event("open")(...params); }}
        onClose={async () => (await adapter.event("close")()) === false ? false : undefined}
        registerComponentApi={adapter.registerApi}
      >
        {(params) => {
          const slotScope = createSlotScope(adapter.scope, {
            $param: params[0],
            $params: params,
          });
          return adapter.context.renderChildren(children, slotScope);
        }}
      </ModalDialogComponent>
    );
  },
});

function modalContentChildren(node: XmluiElement): XmluiNode[] {
  const children = nonPropertyChildren(node.children);
  const vars: Record<string, string> = {};
  const parsedVars: NonNullable<XmluiElement["parsed"]>["vars"] = {};
  const renderedChildren: XmluiNode[] = [];

  for (const child of children) {
    if (child.kind === "element" && child.type === "variable") {
      const name = child.props.name;
      if (name) {
        vars[name] = child.props.value ?? "";
        const parsedValue = child.parsed?.props?.value;
        if (parsedValue) {
          parsedVars[name] = parsedValue;
        }
      }
      continue;
    }
    renderedChildren.push(child);
  }

  if (Object.keys(vars).length === 0) {
    return renderedChildren;
  }

  return [{
    kind: "element",
    type: "Fragment",
    props: {},
    vars,
    globals: {},
    events: {},
    methods: {},
    children: renderedChildren,
    range: node.range,
    ...(Object.keys(parsedVars).length > 0 ? { parsed: { vars: parsedVars } } : {}),
  }];
}
