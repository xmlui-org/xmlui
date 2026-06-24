import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./ContentSeparator.defaults";

const COMP = "ContentSeparator";
const contentSeparatorStylesSource = `
$backgroundColor-ContentSeparator: createThemeVar("backgroundColor-ContentSeparator");
$thickness-ContentSeparator: createThemeVar("thickness-ContentSeparator");
$length-ContentSeparator: createThemeVar("length-ContentSeparator");
$marginTop-ContentSeparator: createThemeVar("marginTop-ContentSeparator");
$marginBottom-ContentSeparator: createThemeVar("marginBottom-ContentSeparator");
$marginVertical-ContentSeparator: createThemeVar("marginVertical-ContentSeparator");
$marginLeft-ContentSeparator: createThemeVar("marginLeft-ContentSeparator");
$marginRight-ContentSeparator: createThemeVar("marginRight-ContentSeparator");
$marginHorizontal-ContentSeparator: createThemeVar("marginHorizontal-ContentSeparator");
$paddingTop-ContentSeparator: createThemeVar("paddingTop-ContentSeparator");
$paddingBottom-ContentSeparator: createThemeVar("paddingBottom-ContentSeparator");
$paddingVertical-ContentSeparator: createThemeVar("paddingVertical-ContentSeparator");
$paddingLeft-ContentSeparator: createThemeVar("paddingLeft-ContentSeparator");
$paddingRight-ContentSeparator: createThemeVar("paddingRight-ContentSeparator");
$paddingHorizontal-ContentSeparator: createThemeVar("paddingHorizontal-ContentSeparator");
`;

export const ContentSeparatorMd = createMetadata({
  status: "stable",
  description:
    "`ContentSeparator` creates visual dividers between content sections using horizontal or vertical lines.",
  props: {
    thickness: {
      description: "Defines the separator thickness.",
      valueType: "any",
    },
    length: {
      description: "Defines the separator length.",
      valueType: "any",
    },
    orientation: {
      description: "Sets the main axis of the component.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
    style: {
      description: "Applies inline CSS style declarations to the separator root.",
      valueType: "string",
    },
    testId: {
      description: "Adds a test identifier to the separator root.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(contentSeparatorStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-200",
    [`thickness-${COMP}`]: "1px",
    [`length-${COMP}`]: "100%",
    [`marginVertical-${COMP}`]: "0",
    [`marginHorizontal-${COMP}`]: "0",
    [`paddingVertical-${COMP}`]: "0",
    [`paddingHorizontal-${COMP}`]: "0",
  },
});
