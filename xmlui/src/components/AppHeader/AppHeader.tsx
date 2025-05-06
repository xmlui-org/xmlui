import styles from "./AppHeader.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject } from "../../components-core/theming/themes/base-utils";
import { dComponent } from "../../components/metadata-helpers";
import { SlotItem } from "../../components/SlotItem";
import { AppContextAwareAppHeader } from "./AppHeaderNative";

const COMP = "AppHeader";

export const AppHeaderMd = createMetadata({
  status: "experimental",
  description: `\`${COMP}\` is a placeholder within \`App\` to define a custom application header.`,
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
      defaultValue: true,
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
    [`height-${COMP}`]: "$space-14",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content-App",
    [`maxWidth-${COMP}`]: "$maxWidth-App",
    [`borderBottom-${COMP}`]: "1px solid $borderColor",
    ...paddingSubject(`logo-${COMP}`, { horizontal: "$space-0", vertical: "$space-4" }),
    ...paddingSubject(COMP, { horizontal: "$space-4", vertical: "$space-0" }),
    [`borderRadius-${COMP}`]: "0px",
    [`backgroundColor-${COMP}`]: "$color-surface-raised",
  },
});

export const appHeaderComponentRenderer = createComponentRenderer(
  COMP,
  AppHeaderMd,
  ({ node, renderChild, layoutCss, layoutContext, extractValue }) => {
    // --- Convert the plain (text) logo template into component definition
    const logoTemplate = node.props.logoTemplate || node.slots?.logoSlot;
    const titleTemplate = node.props.titleTemplate || node.slots?.titleSlot;
    return (
      <AppContextAwareAppHeader
        profileMenu={renderChild(extractValue(node.props.profileMenuTemplate, true))} // NOTE: if this a component template, why is the default true?
        title={extractValue(node.props.title)}
        showLogo={extractValue.asOptionalBoolean(node.props.showLogo, true)}
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
        style={layoutCss}
        className={layoutContext?.themeClassName}
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