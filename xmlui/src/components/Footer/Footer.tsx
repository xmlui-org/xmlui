import styles from "./Footer.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Footer } from "./FooterNative";
import { createMetadata } from "../metadata-helpers";
import classnames from "classnames";

const COMP = "Footer";

export const FooterMd = createMetadata({
  status: "stable",
  description:
    "`Footer` provides a designated area at the bottom of your application for " +
    "footer content such as branding, copyright notices, or utility controls like " +
    "theme toggles.",
  props: {
    nonSticky: {
      description:
        "When set to true, undocks the Footer from the bottom of the page for non-desktop layouts, " +
        "allowing it to scroll with the main content. In desktop layout, the Footer remains sticky " +
        "regardless of this property.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-AppHeader",
    [`verticalAlignment-${COMP}`]: "center",
    [`fontSize-${COMP}`]: "$fontSize-sm",
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
  ({ node, renderChild, className, layoutContext, extractValue }) => {
    const nonSticky = extractValue.asOptionalBoolean(node.props.nonSticky, false);
    
    return (
      <Footer 
        className={classnames(layoutContext?.themeClassName, className)}
        nonSticky={nonSticky}
      >
        {renderChild(node.children, {
          type: "Stack",
          orientation: "horizontal",
        })}
      </Footer>
    );
  },
);
