import { createMetadata, dLabel } from "../../component-core/metadata/helpers";
import { defaultProps } from "./NoResult.defaults";

const COMP = "NoResult";
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
  themeVars: Object.fromEntries([
    ...borderThemeVarNames(COMP),
    ...paddingThemeVarNames(COMP),
    `gap-icon-${COMP}`,
    `size-icon-${COMP}`,
    `backgroundColor-${COMP}`,
  ].map((name) => [name, `Theme variable declared by ${name}.`])),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`gap-icon-${COMP}`]: "$space-2",
    [`size-icon-${COMP}`]: "$space-8",
  },
});

function borderThemeVarNames(subject: string): string[] {
  return [
    "border",
    "borderHorizontal",
    "borderVertical",
    "borderLeft",
    "borderRight",
    "borderTop",
    "borderBottom",
    "borderWidth",
    "borderHorizontalWidth",
    "borderLeftWidth",
    "borderRightWidth",
    "borderVerticalWidth",
    "borderTopWidth",
    "borderBottomWidth",
    "borderStyle",
    "borderHorizontalStyle",
    "borderLeftStyle",
    "borderRightStyle",
    "borderVerticalStyle",
    "borderTopStyle",
    "borderBottomStyle",
    "borderColor",
    "borderHorizontalColor",
    "borderLeftColor",
    "borderRightColor",
    "borderVerticalColor",
    "borderTopColor",
    "borderBottomColor",
    "borderRadius",
    "borderStartStartRadius",
    "borderStartEndRadius",
    "borderEndStartRadius",
    "borderEndEndRadius",
  ].map((name) => `${name}-${subject}`);
}

function paddingThemeVarNames(subject: string): string[] {
  return [
    "padding",
    "paddingHorizontal",
    "paddingVertical",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
  ].map((name) => `${name}-${subject}`);
}
