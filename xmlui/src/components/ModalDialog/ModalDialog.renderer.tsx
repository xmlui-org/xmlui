import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createSlotScope } from "../../runtime/rendering/components";
import { wrapComponent } from "../../runtime/rendering/adapter";
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
    const title = hasTitleTemplate
      ? adapter.renderTemplate("titleTemplate")
      : adapter.stringProp("title");

    return (
      <ModalDialogComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        fullScreen={adapter.booleanProp("fullScreen", defaultProps.fullScreen)}
        initiallyOpen={Object.prototype.hasOwnProperty.call(adapter.props, "when")}
        closeButtonVisible={adapter.booleanProp("closeButtonVisible", defaultProps.closeButtonVisible)}
        title={title}
        onOpen={(...params) => { void adapter.event("open")(...params); }}
        onClose={() => { void adapter.event("close")(); }}
        registerComponentApi={adapter.registerApi}
      >
        {(params) => adapter.context.renderChildren(
          adapter.node.children.filter((child) =>
            !(child.kind === "element" && child.type === "property"),
          ),
          createSlotScope(adapter.scope, {
            $param: params[0],
            $params: params,
          }),
        )}
      </ModalDialogComponent>
    );
  },
});
