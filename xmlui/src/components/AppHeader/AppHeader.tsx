import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import appHeaderStylesSource from "./AppHeader.module.scss?xmlui-theme-vars";
import { defaultProps } from "./AppHeader.defaults";

const COMP = "AppHeader";

export const AppHeaderMd = createMetadata({
  status: "in progress",
  description:
    "`AppHeader` defines the top navigation bar of an application within the App component.",
  props: {
    profileMenuTemplate: dComponent(
      `This property makes the profile menu slot of the \`${COMP}\` component customizable.`,
    ),
    logoTemplate: dComponent(
      "This property defines the template to use for the logo.",
    ),
    titleTemplate: dComponent(
      "This property defines the template to use for the title.",
    ),
    title: {
      description: "Title for the application logo.",
      valueType: "string",
    },
    showLogo: {
      description: "Show the logo in the header.",
      valueType: "boolean",
      defaultValue: defaultProps.showLogo,
    },
  },
  themeVars: extractScssThemeVars(appHeaderStylesSource),
  themeVarDescriptions: {
    [`padding-logo-${COMP}`]:
      "This theme variable sets the padding of the logo in the app header.",
    [`width-logo-${COMP}`]: "Sets the width of the displayed logo.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`padding-drawerToggle-${COMP}`]: "$space-0_5",
    [`size-drawerToggle-${COMP}`]: "$space-12",
    [`height-${COMP}`]: "$space-14",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content-App",
    [`maxWidth-${COMP}`]: "$maxWidth-App",
    [`border-${COMP}`]: "0 solid transparent",
    [`borderTop-${COMP}`]: "0 solid transparent",
    [`borderRight-${COMP}`]: "0 solid transparent",
    [`borderBottom-${COMP}`]: "1px solid $borderColor",
    [`borderLeft-${COMP}`]: "0 solid transparent",
    [`paddingHorizontal-logo-${COMP}`]: "$space-0",
    [`paddingVertical-logo-${COMP}`]: "$space-0",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`paddingVertical-${COMP}`]: "$space-0",
    [`paddingTop-${COMP}`]: "$space-0",
    [`paddingRight-${COMP}`]: "$space-4",
    [`paddingBottom-${COMP}`]: "$space-0",
    [`paddingLeft-${COMP}`]: "$space-4",
    [`borderRadius-${COMP}`]: "0px",
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
    [`alignment-content-${COMP}`]: "flex-start",
  },
});
