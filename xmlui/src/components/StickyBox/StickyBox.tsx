import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./StickyBox.defaults";

const COMP = "StickyBox";
const stickyBoxStylesSource = `
  createThemeVar("backgroundColor-StickyBox");
`;

export const StickyBoxMd = createMetadata({
  status: "stable",
  description: "`StickyBox` remains fixed at the top or bottom of the screen as the user scrolls.",
  props: {
    to: {
      description: "This property determines whether the StickyBox should be anchored to the `top` or `bottom`.",
      availableValues: ["top", "bottom"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: defaultProps.to,
    },
    testId: {
      description: "Adds a test identifier to the StickyBox root.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(stickyBoxStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
  },
});

