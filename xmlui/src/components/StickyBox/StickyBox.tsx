import styles from "./StickyBox.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { StickyBox, defaultProps } from "./StickyBoxReact";
import { createMetadata } from "../metadata-helpers";

const COMP = "StickyBox";

export const StickyBoxMd = createMetadata({
  status: "stable",
  description:
    "`StickyBox` remains fixed at the top or bottom of the screen as the user scrolls.",
  props: {
    to: {
      description:
        "This property determines whether the StickyBox should be anchored to " +
        "the \`top\` or \`bottom\`.",
      availableValues: ["top", "bottom"],
      valueType: "string",
      defaultValue: defaultProps.to,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
  },
});

export const stickyBoxComponentRenderer = wrapComponent(COMP, StickyBox, StickyBoxMd, {
  passUid: true,
});
