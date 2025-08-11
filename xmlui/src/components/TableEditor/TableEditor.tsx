import React from "react";

import { createMetadata } from "../metadata-helpers";
import { createComponentRenderer } from "../../components-core/renderers";
import { buttonThemeMd, buttonVariantMd, sizeMd } from "../abstractions";
import styles from "./TableEditor.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { TableEditor } from "./TableEditorNative";

// Create metadata for TableEditor that defines allowed props
export const TableEditorMd = createMetadata({
  status: "stable",
  description:
    "`TableEditor` provides an interactive table editing interface with controls for adding and deleting rows and columns. It supports theme customization and exports table data in HTML and Markdown formats.",
  props: {
    themeColor: {
      description: "Sets the color scheme for all editor buttons.",
      isRequired: false,
      type: "string",
      availableValues: buttonThemeMd,
      defaultValue: "primary",
    },
    variant: {
      description: "Sets the visual style for all editor buttons.",
      isRequired: false,
      type: "string",
      availableValues: buttonVariantMd,
      defaultValue: "solid",
    },
    size: {
      description: "Sets the size for all editor buttons.",
      isRequired: false,
      type: "string",
      availableValues: sizeMd,
      defaultValue: "sm",
    },
  },
  events: {
    didChange: {
      description: "Fired whenever the table content changes. Payload: { html, markdown }.",
      isRequired: false,
      type: "function",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const editorComponentRenderer = createComponentRenderer(
  "TableEditor",
  TableEditorMd,
  ({ node, extractValue, registerComponentApi, lookupEventHandler }) => {
    const handler = lookupEventHandler?.("didChange");
    return (
      <TableEditor
        themeColor={extractValue.asOptionalString(node.props.themeColor)}
        variant={extractValue.asOptionalString(node.props.variant)}
        size={extractValue.asOptionalString(node.props.size)}
        registerComponentApi={registerComponentApi}
        onDidChange={handler}
      />
    );
  },
);
