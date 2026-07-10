import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { Toast } from "./ToastReact";
import { MemoizedItem } from "../container-helpers";
import React from "react";
import hotToast from "react-hot-toast";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { nonPropertyChildren, templateChildren, wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { createRuntimeScope } from "../../runtime/state";
import type { XmluiNode } from "../../compiler/ir";

const COMP = "Toast";

export const ToastMd = createMetadata({
  status: "internal",
  description: "",
  props: {},
  events: {},
  apis: {},
});

export const toastComponentRenderer = wrapComponent(COMP, Toast, ToastMd, {
  exposeRegisterApi: true,
  customRender: (_props, { node, registerComponentApi, renderChild }) => (
    <Toast
      registerComponentApi={registerComponentApi}
      renderContent={(type, context) => {
        let template = null;
        switch (type) {
          case "success":
            template = node.props.successTemplate;
            break;
          case "loading":
            template = node.props.loadingTemplate;
            break;
          case "error":
            template = node.props.errorTemplate;
            break;
          default: {
            template = node.children;
          }
        }
        return (
          <MemoizedItem
            node={template || node.children}
            contextVars={{
              $param: context,
            }}
            renderChild={renderChild}
          />
        );
      }}
    />
  ),
});

export const toastRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ToastMd as ComponentMetadata,
  renderer: ({ adapter }) => <RuntimeToast adapter={adapter} />,
});

function RuntimeToast({ adapter }: { adapter: XmluiComponentAdapter }) {
  React.useEffect(() => {
    clearHotToasts();
    return clearHotToasts;
  }, []);
  return (
    <Toast
      registerComponentApi={adapter.registerApi}
      renderContent={(type, context) => renderToastContent(adapter, type, context)}
    />
  );
}

function clearHotToasts() {
  hotToast.dismiss();
  (hotToast as unknown as { remove?: () => void }).remove?.();
}

function renderToastContent(
  adapter: XmluiComponentAdapter,
  type: string | null,
  context: unknown,
) {
  return renderToastChildren(adapter, selectToastTemplate(adapter, type), context);
}

function selectToastTemplate(adapter: XmluiComponentAdapter, type: string | null): XmluiNode[] {
  const templateName =
    type === "success"
      ? "successTemplate"
      : type === "loading"
        ? "loadingTemplate"
        : type === "error"
          ? "errorTemplate"
          : undefined;
  return templateName
    ? templateChildren(adapter.node, templateName) ?? nonPropertyChildren(adapter.node.children)
    : nonPropertyChildren(adapter.node.children);
}

function renderToastChildren(
  adapter: XmluiComponentAdapter,
  children: XmluiNode[],
  context: unknown,
) {
  const templateScope = createRuntimeScope({
    store: adapter.scope.store,
    parent: adapter.scope,
    props: adapter.scope.props,
    contextValues: { $param: context },
    references: adapter.scope.references,
    slots: adapter.scope.slots,
    routing: adapter.scope.routing,
    toast: adapter.scope.toast,
    emitEvent: adapter.scope.emitEvent,
    extensionFunctions: adapter.scope.extensionFunctions,
  });
  return adapter.context.renderChildren(children, templateScope, adapter.node.range.end);
}
