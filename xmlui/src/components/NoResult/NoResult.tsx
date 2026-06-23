import { createMetadata, dLabel } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./NoResult.defaults";

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
