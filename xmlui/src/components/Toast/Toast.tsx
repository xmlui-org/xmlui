import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { Toast } from "./ToastReact";
import { MemoizedItem } from "../container-helpers";

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
