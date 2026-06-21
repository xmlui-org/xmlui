import type { ReactNode } from "react";
import type { CSSProperties } from "react";

import { createMetadata, dLabel } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./NoResult.defaults";
import { NoResult } from "./NoResultReact";

const COMP = "NoResult";
const noResultStylesSource = `
$backgroundColor-NoResult: createThemeVar("backgroundColor-NoResult");
$border-NoResult: createThemeVar("border-NoResult");
$paddingVertical-NoResult: createThemeVar("paddingVertical-NoResult");
$gap-icon-NoResult: createThemeVar("gap-icon-NoResult");
$size-icon-NoResult: createThemeVar("size-icon-NoResult");
`;

export const NoResultMd = createMetadata({
  status: "stable",
  description: "`NoResult` displays a visual indication that a query or search returned nothing.",
  props: {
    label: dLabel(),
    icon: {
      description: "This property defines the icon to display with the component.",
      valueType: "string",
      defaultValue: defaultProps.icon,
    },
    hideIcon: {
      description: "This boolean property indicates if the icon should be hidden.",
      valueType: "boolean",
      defaultValue: defaultProps.hideIcon,
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(noResultStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`gap-icon-${COMP}`]: "$space-2",
    [`size-icon-${COMP}`]: "$space-8",
  },
});

export const noResultRenderer = wrapComponent({
  name: COMP,
  metadata: NoResultMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <NoResult
        {...rootAttrs}
        style={noResultRootStyle(rootAttrs.style as CSSProperties | undefined)}
        data-testid={adapter.stringProp("testId", "test-id-component")}
        label={labelFor(adapter.prop("label"), adapter.renderChildren())}
        icon={adapter.stringProp("icon", defaultProps.icon)}
        hideIcon={adapter.booleanProp("hideIcon", defaultProps.hideIcon)}
      />
    );
  },
});

function labelFor(label: unknown, children: ReactNode): ReactNode {
  if (label !== undefined && label !== null) {
    return String(label);
  }
  if (children !== undefined && children !== null && children !== "") {
    return children;
  }
  return "No results found";
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
