import styles from "./NoResult.module.scss";

import { type CSSProperties } from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dLabel } from "../metadata-helpers";
import { defaultProps } from "./NoResult.defaults";
import { NoResult } from "./NoResultReact";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode, XmluiText } from "../../compiler/ir";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "NoResult";

export const NoResultMd = createMetadata({
  status: "stable",
  description: "`NoResult` displays a visual indication that a query or search returned nothing.",
  props: {
    label: dLabel(),
    icon: {
      description: `This property defines the icon to display with the component.`,
      valueType: "string",
      defaultValue: defaultProps.icon,
    },
    hideIcon: {
      description: `This boolean property indicates if the icon should be hidden.`,
      valueType: "boolean",
      defaultValue: defaultProps.hideIcon,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`gap-icon-${COMP}`]: "$space-2",
    [`size-icon-${COMP}`]: "$space-8",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const noResultComponentRenderer = wrapComponent(COMP, NoResult, NoResultMd, {
  customRender: (_props, { node, extractValue, classes }) => (
    <NoResult
      label={extractValue.asDisplayText(node.props.label || node.children || "No results found")}
      icon={extractValue.asOptionalString(node.props.icon)}
      hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
      classes={classes}
    />
  ),
});

export const noResultRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: NoResultMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <NoResult
        {...rootAttrs}
        style={noResultRootStyle(rootAttrs.style as CSSProperties | undefined)}
        data-testid={adapter.stringProp("testId", "test-id-component")}
        label={labelFor(adapter.prop("label"), adapter.node.children)}
        icon={adapter.stringProp("icon", defaultProps.icon)}
        hideIcon={adapter.booleanProp("hideIcon", defaultProps.hideIcon)}
      />
    );
  },
});

function labelFor(label: unknown, children: XmluiNode[]): string {
  if (label !== undefined && label !== null) {
    return String(label);
  }
  const childText = textChildren(children);
  return childText || "No results found";
}

function textChildren(children: XmluiNode[]): string {
  return children
    .filter((child): child is XmluiText => child.kind === "text")
    .map((child) => child.value)
    .join("")
    .trim();
}

function noResultRootStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return style;
  }
  const result: Record<string, unknown> = { ...style };
  for (const name of optionalNoResultThemeVariables) {
    delete result[`--xmlui-${name}`];
  }
  return result as CSSProperties;
}

const optionalNoResultThemeVariables = [
  "padding-NoResult",
  "paddingHorizontal-NoResult",
  "paddingLeft-NoResult",
  "paddingRight-NoResult",
  "paddingTop-NoResult",
  "paddingBottom-NoResult",
];
