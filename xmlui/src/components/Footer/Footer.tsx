import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import footerStylesSource from "./Footer.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Footer.defaults";

const COMP = "Footer";

export const FooterMd = createMetadata({
  status: "in progress",
  description:
    "`Footer` provides a designated area at the bottom of an application for footer content.",
  props: {
    sticky: {
      description:
        "When set to true, keeps the Footer docked to the bottom of the page in sticky layouts.",
      valueType: "boolean",
      defaultValue: defaultProps.sticky,
    },
  },
  themeVars: extractScssThemeVars(footerStylesSource),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-AppHeader",
    [`verticalAlignment-${COMP}`]: "center",
    [`fontSize-${COMP}`]: "$fontSize-sm",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`border-${COMP}`]: "0 solid transparent",
    [`borderTop-${COMP}`]: "1px solid $borderColor",
    [`borderRight-${COMP}`]: "0 solid transparent",
    [`borderBottom-${COMP}`]: "0 solid transparent",
    [`borderLeft-${COMP}`]: "0 solid transparent",
    [`borderRadius-${COMP}`]: "0",
    [`padding-${COMP}`]: "$space-2 $space-4",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingTop-${COMP}`]: "$space-2",
    [`paddingRight-${COMP}`]: "$space-4",
    [`paddingBottom-${COMP}`]: "$space-2",
    [`paddingLeft-${COMP}`]: "$space-4",
    [`gap-${COMP}`]: "$space-normal",
    [`height-${COMP}`]: "auto",
    [`margin-${COMP}`]: "0 auto",
  },
});
