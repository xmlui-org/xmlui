import styles from "./Footer.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Footer } from "./FooterNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "Footer";

export const FooterMd = createMetadata({
  status: "stable",
  description:
    "`Footer` provides a designated area at the bottom of your application for " +
    "footer content such as branding, copyright notices, or utility controls like " +
    "theme toggles.",
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-AppHeader",
    [`verticalAlignment-${COMP}`]: "center",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`borderTop-${COMP}`]: `1px solid $borderColor`,
    [`padding-${COMP}`]: "$space-2 $space-4",
    [`gap-${COMP}`]: "$space-normal",
    [`margin-${COMP}`]: `0 auto`,
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const footerRenderer = createComponentRenderer(
  COMP,
  FooterMd,
  ({ node, renderChild, layoutCss, layoutContext }) => {
    return (
      <Footer style={layoutCss} className={layoutContext?.themeClassName}>
        {renderChild(node.children, {
          type: "Stack",
          orientation: "horizontal",
        })}
      </Footer>
    );
  },
);
