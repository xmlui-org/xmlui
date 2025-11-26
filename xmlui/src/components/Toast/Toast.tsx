import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Toast } from "./ToastNative";
import { MemoizedItem } from "../container-helpers";

const COMP = "Toast";

export const ToastMd = createMetadata({
  status: "internal",
  description: "",
  props: {},
  events: {},
  apis: {},
});

export const toastComponentRenderer = createComponentRenderer(
  COMP,
  ToastMd,
  ({ node, extractValue, lookupEventHandler, registerComponentApi, renderChild }) => {
    return (
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
    );
  },
);
