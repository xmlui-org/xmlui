import styles from "./AppHeader.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject } from "../../components-core/theming/themes/base-utils";
import { createMetadata, dComponent } from "../../components/metadata-helpers";
import { SlotItem } from "../../components/SlotItem";
import { AppContextAwareAppHeader, defaultProps } from "./AppHeaderNative";
import classnames from "classnames";

const COMP = "AppHeader";

export const AppHeaderMd = createMetadata({
  status: "stable",
  description:
    "`AppHeader` defines the top navigation bar of your application within the " +
    "[`App`](/components/App) component. It automatically handles logo placement, " +
    "application title, and user profile areas with built-in responsive behavior.",
  props: {
    profileMenuTemplate: dComponent(
      `This property makes the profile menu slot of the \`${COMP}\` component customizable.`,
    ),
    logoTemplate: dComponent(
      "This property defines the template to use for the logo. With this property, you can " +
        "construct your custom logo instead of using a single image.",
    ),
    titleTemplate: dComponent(
      "This property defines the template to use for the title. With this property, you can " +
        "construct your custom title instead of using a single image.",
    ),
    title: {
      description: "Title for the application logo",
      valueType: "string",
    },
    showLogo: {
      description: "Show the logo in the header",
      valueType: "boolean",
      defaultValue: defaultProps.showLogo,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`padding‑logo‑${COMP}`]:
      "This theme variable sets the padding of the logo in the app header (including all " +
      "`padding` variants, such as `paddingLeft-logo-AppHeader` and others).",
    [`width‑logo‑${COMP}`]: "Sets the width of the displayed logo",
  },
  defaultThemeVars: {
    [`padding-drawerToggle-${COMP}`]: "$space-0_5",
    [`height-${COMP}`]: "$space-14",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content-App",
    [`maxWidth-${COMP}`]: "$maxWidth-App",
    [`borderBottom-${COMP}`]: "1px solid $borderColor",
    ...paddingSubject(`logo-${COMP}`, { horizontal: "$space-0", vertical: "$space-0" }),
    ...paddingSubject(COMP, { horizontal: "$space-4", vertical: "$space-0" }),
    [`borderRadius-${COMP}`]: "0px",
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
  },
});

export const appHeaderComponentRenderer = createComponentRenderer(
  COMP,
  AppHeaderMd,
  ({ node, renderChild, className, layoutContext, extractValue }) => {
    // --- Convert the plain (text) logo template into component definition
    const logoTemplate = node.props.logoTemplate || node.slots?.logoSlot;
    const titleTemplate = node.props.titleTemplate || node.slots?.titleSlot;
    return (
      <AppContextAwareAppHeader
        profileMenu={renderChild(extractValue(node.props.profileMenuTemplate, true))}
        title={extractValue(node.props.title)}
        showLogo={extractValue.asOptionalBoolean(node.props.showLogo)}
        titleContent={
          titleTemplate && (
            <SlotItem
              node={titleTemplate}
              renderChild={renderChild}
              slotProps={{ title: extractValue(node.props.title) }}
            />
          )
        }
        logoContent={renderChild(logoTemplate, {
          type: "Stack",
          orientation: "horizontal",
        })}
        className={classnames(layoutContext?.themeClassName, className)}
        renderChild={renderChild}
      >
        {renderChild(node.children, {
          // Since the AppHeader is a flex container, it's children should behave the same as in a stack
          type: "Stack",
        })}
      </AppContextAwareAppHeader>
    );
  },
);
