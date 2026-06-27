import type { CSSProperties } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { defaultProps } from "./Inspector.defaults";
import { InspectorComponent } from "./InspectorReact";

const COMP = "Inspector";

export const InspectorMd = createMetadata({
  status: "experimental",
  description:
    "`Inspector` provides an in-app trace viewer for XMLUI applications.",
  props: {
    src: {
      description: "Path to the inspector HTML file.",
      valueType: "string",
      defaultValue: defaultProps.src,
    },
    tooltip: {
      description: "Tooltip text shown when hovering over the inspector icon.",
      valueType: "string",
      defaultValue: defaultProps.tooltip,
    },
    dialogTitle: {
      description: "Title displayed in the inspector modal dialog header.",
      valueType: "string",
      defaultValue: defaultProps.dialogTitle,
    },
    dialogWidth: {
      description: "Minimum width of the inspector modal dialog.",
      valueType: "string",
      defaultValue: defaultProps.dialogWidth,
    },
    dialogHeight: {
      description: "Minimum height of the inspector modal dialog.",
      valueType: "string",
      defaultValue: defaultProps.dialogHeight,
    },
    testId: {
      description: "Adds a test identifier to the inspector trigger.",
      valueType: "string",
    },
  },
  apis: {
    open: {
      description: "Opens the inspector dialog programmatically.",
      signature: "open(): void",
    },
    close: {
      description: "Closes the inspector dialog programmatically.",
      signature: "close(): void",
    },
    isOpen: {
      description: "Returns true when the inspector dialog is open.",
      signature: "isOpen(): boolean",
    },
  },
  themeVars: {
    [`color-icon-${COMP}`]: "The inspector icon color.",
    [`backgroundColor-dialog-${COMP}`]: "The inspector dialog content background color.",
  },
  defaultThemeVars: {
    [`color-icon-${COMP}`]: "$color-surface-500",
    [`backgroundColor-dialog-${COMP}`]: "$color-surface-300",
  },
});

export const inspectorRenderer = wrapComponent({
  name: COMP,
  metadata: InspectorMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <InspectorComponent
        className={rootAttrs.className as string | undefined}
        style={rootAttrs.style as CSSProperties}
        src={adapter.stringProp("src", defaultProps.src)}
        tooltip={adapter.stringProp("tooltip", defaultProps.tooltip)}
        dialogTitle={adapter.stringProp("dialogTitle", defaultProps.dialogTitle)}
        dialogWidth={adapter.stringProp("dialogWidth", defaultProps.dialogWidth)}
        dialogHeight={adapter.stringProp("dialogHeight", defaultProps.dialogHeight)}
        testId={adapter.stringProp("testId")}
        registerApi={adapter.registerApi}
      />
    );
  },
});
